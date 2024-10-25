import { components } from 'api-types'
import {
  DISK_LIMITS,
  DISK_PRICING,
  DiskType,
  PLAN_DETAILS,
  COMPUTE_BASELINE_IOPS,
} from './DiskManagement.constants'
import { INSTANCE_MICRO_SPECS } from 'lib/constants'
import { ProjectAddonVariantMeta } from 'data/subscriptions/types'
import { useMemo } from 'react'

// Included disk size only applies to primary, not replicas
export const calculateDiskSizePrice = ({
  planId,
  oldSize,
  oldStorageType,
  newSize,
  newStorageType,
  numReplicas = 0,
}: {
  planId: string
  oldSize: number
  oldStorageType: DiskType
  newSize: number
  newStorageType: DiskType
  numReplicas?: number
}) => {
  const oldPricePerGB = DISK_PRICING[oldStorageType]?.storage ?? 0
  const newPricePerGB = DISK_PRICING[newStorageType]?.storage ?? 0
  const { includedDiskGB } = PLAN_DETAILS?.[planId as keyof typeof PLAN_DETAILS] ?? {}

  const oldPrice = Math.max(oldSize - includedDiskGB[oldStorageType], 0) * oldPricePerGB
  const oldPriceReplica = oldSize * 1.25 * oldPricePerGB
  const newPrice = Math.max(newSize - includedDiskGB[newStorageType], 0) * newPricePerGB
  const newPriceReplica = newSize * 1.25 * newPricePerGB

  return {
    oldPrice: (oldPrice + numReplicas * oldPriceReplica).toFixed(2),
    newPrice: (newPrice + numReplicas * newPriceReplica).toFixed(2),
  }
}

export const calculateComputeSizePrice = ({
  availableOptions,
  oldComputeSize,
  newComputeSize,
}: {
  availableOptions: {
    identifier: string
    price: number
  }[]
  oldComputeSize: string
  newComputeSize: string
}) => {
  const oldPrice = availableOptions?.find((x) => x.identifier === oldComputeSize)?.price * 720
  const newPrice = availableOptions?.find((x) => x.identifier === newComputeSize)?.price * 720

  return {
    oldPrice,
    newPrice,
  }
}

// Included IOPS applies to both primary and replicas
export const calculateIOPSPrice = ({
  oldStorageType,
  oldProvisionedIOPS,
  newStorageType,
  newProvisionedIOPS,
  numReplicas = 0,
}: {
  oldStorageType: DiskType
  oldProvisionedIOPS: number
  newStorageType: DiskType
  newProvisionedIOPS: number
  numReplicas?: number
}) => {
  if (newStorageType === DiskType.GP3) {
    const oldChargeableIOPS = Math.max(
      0,
      oldProvisionedIOPS - DISK_LIMITS[DiskType.GP3].includedIops
    )
    const newChargeableIOPS = Math.max(
      0,
      newProvisionedIOPS - DISK_LIMITS[DiskType.GP3].includedIops
    )
    const oldPrice = oldChargeableIOPS * DISK_PRICING[oldStorageType]?.iops ?? 0

    const newPrice = newChargeableIOPS * DISK_PRICING[newStorageType]?.iops ?? 0

    return {
      oldPrice: (oldPrice * (1 + numReplicas)).toFixed(2),
      newPrice: (newPrice * (1 + numReplicas)).toFixed(2),
    }
  } else {
    const oldPrice =
      oldStorageType === 'gp3'
        ? (oldProvisionedIOPS - DISK_LIMITS[oldStorageType].includedIops) *
          DISK_PRICING[oldStorageType].iops
        : oldProvisionedIOPS * DISK_PRICING[oldStorageType]?.iops ?? 0
    const newPrice = newProvisionedIOPS * DISK_PRICING[newStorageType]?.iops ?? 0
    return {
      oldPrice: (oldPrice * (1 + numReplicas)).toFixed(2),
      newPrice: (newPrice * (1 + numReplicas)).toFixed(2),
    }
  }
}

// This is only applicable for GP3 storage type, no need to consider IO2 at all
// Also assumes that disk size is > 400 GB (separate requirement to update throughput)
// Also, included throughput applies to both primary and replicas
export const calculateThroughputPrice = ({
  storageType,
  newThroughput,
  oldThroughput,
  numReplicas = 0,
}: {
  storageType: DiskType
  newThroughput: number
  oldThroughput: number
  numReplicas?: number
}) => {
  if (storageType === DiskType.GP3 && newThroughput) {
    const oldChargeableThroughput = Math.max(
      0,
      oldThroughput - DISK_LIMITS[DiskType.GP3].includedThroughput
    )
    const newChargeableThroughput = Math.max(
      0,
      newThroughput - DISK_LIMITS[DiskType.GP3].includedThroughput
    )
    const oldPrice = oldChargeableThroughput * DISK_PRICING[DiskType.GP3].throughput
    const newPrice = newChargeableThroughput * DISK_PRICING[DiskType.GP3].throughput

    return {
      oldPrice: (oldPrice * (1 + numReplicas)).toFixed(2),
      newPrice: (newPrice * (1 + numReplicas)).toFixed(2),
    }
  }
  return { oldPrice: '0.00', newPrice: '0.00' }
}

export function getAvailableComputeOptions(availableAddons: any[], projectCloudProvider?: string) {
  const computeOptions =
    availableAddons
      .find((addon) => addon.type === 'compute_instance')
      ?.variants.filter((option) => {
        if (!projectCloudProvider) {
          return true
        }

        const meta = option.meta as ProjectAddonVariantMeta

        return (
          !meta.supported_cloud_providers ||
          meta.supported_cloud_providers.includes(projectCloudProvider)
        )
      }) ?? []

  function hasMicroOptionFromApi() {
    return (
      availableAddons.find((addon) => addon.type === 'compute_instance')?.variants ?? []
    ).some((variant: any) => variant.identifier === 'ci_micro')
  }

  // Backwards comp until API is deployed
  if (!hasMicroOptionFromApi) {
    // Unshift to push to start of array
    computeOptions.unshift({
      identifier: 'ci_micro',
      name: 'Micro',
      price_description: '$0.01344/hour (~$10/month)',
      price: 0.01344,
      price_interval: 'hourly',
      price_type: 'usage',
      meta: {
        cpu_cores: INSTANCE_MICRO_SPECS.cpu_cores,
        cpu_dedicated: INSTANCE_MICRO_SPECS.cpu_dedicated,
        memory_gb: INSTANCE_MICRO_SPECS.memory_gb,
        baseline_disk_io_mbs: INSTANCE_MICRO_SPECS.baseline_disk_io_mbs,
        max_disk_io_mbs: INSTANCE_MICRO_SPECS.max_disk_io_mbs,
        connections_direct: INSTANCE_MICRO_SPECS.connections_direct,
        connections_pooler: INSTANCE_MICRO_SPECS.connections_pooler,
      } as ProjectAddonVariantMeta,
    })
  }

  return computeOptions
}

export const calculateMaxIopsAllowedForDiskSizeWithGp3 = (totalSize: number) => {
  if (!totalSize) throw Error('Total size is required')
  return Math.min(3000 * totalSize, 16000)
}

export const calculateDiskSizeRequiredForIopsWithGp3 = (iops: number) => {
  if (!iops) throw Error('IOPS is required')
  return Math.max(1, Math.ceil(iops / 3000))
}

export const calculateMaxIopsAllowedForDiskSizeWithio2 = (totalSize: number) => {
  if (!totalSize) throw Error('Total size is required')
  return Math.min(500 * totalSize, 256000)
}

export const calculateDiskSizeRequiredForIopsWithIo2 = (iops: number) => {
  if (!iops) throw Error('IOPS is required')
  return Math.max(4, Math.ceil(iops / 500))
}

export const calculateMaxThroughput = (iops: number) => {
  if (!iops) throw Error('IOPS is required')
  return Math.min(0.256 * iops, 1000)
}

export const calculateIopsRequiredForThroughput = (throughput: number) => {
  if (!throughput) throw Error('Throughput is required')
  return Math.max(125, Math.ceil(throughput / 0.256))
}

export const calculateMaxIopsAllowedForComputeSize = (computeSize: string): number => {
  if (!computeSize) throw Error('Compute size is required')
  return COMPUTE_BASELINE_IOPS[computeSize as keyof typeof COMPUTE_BASELINE_IOPS] || 0
}

export const calculateComputeSizeRequiredForIops = (iops: number) => {
  if (iops === undefined || iops === null) {
    throw new Error('IOPS is required')
  }

  const computeSizes = Object.entries(COMPUTE_BASELINE_IOPS).sort((a, b) => a[1] - b[1])
  for (const [size, baselineIops] of computeSizes) {
    if (iops <= baselineIops) {
      return size.toUpperCase().replace('CI_', '')
    }
  }

  // fallback to largest compute size
  // this should never happen though :-/
  return computeSizes[computeSizes.length - 1][0].toUpperCase().replace('CI_', '')
}

export const calculateDiskSizeRequiredForIops = (provisionedIOPS: number): number => {
  if (provisionedIOPS === undefined || provisionedIOPS === null) {
    throw new Error('Provisioned IOPS is required')
  }

  if (typeof provisionedIOPS !== 'number' || isNaN(provisionedIOPS) || provisionedIOPS < 0) {
    throw new Error('Provisioned IOPS must be a non-negative number')
  }

  if (provisionedIOPS > 256000) {
    throw new Error('Maximum allowed IOPS is 256000')
  }

  return Math.max(1, Math.ceil(provisionedIOPS / 1000))
}
