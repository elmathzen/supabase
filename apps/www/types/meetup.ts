export interface Meetup {
  id: number
  created_at: string | null
  date: string | number
  display_info: string | null
  link: string | null
  location: string | null
  is_live: boolean
  city?: string
  timezone?: string
  title: string
  description: string
}
