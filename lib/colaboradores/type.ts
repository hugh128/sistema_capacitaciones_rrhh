export type Collaborator = {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  status: "active" | "inactive" | "on-leave"
  avatar?: string
  initials: string
  joinDate: string
  completionScore: number
  manager: string
}
