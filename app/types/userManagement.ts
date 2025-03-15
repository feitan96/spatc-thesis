export interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    contactNumber: string
    address: string
    isDeleted: boolean
  }
  
  export interface BinAssignment {
    id: string
    bin: string
    assignee: string[]
  }
  
  export interface UserListProps {
    users: User[]
    onUserDeleted: () => void
  }
  
  export interface UserCardProps {
    user: User
    onUserDeleted: () => void
  }
  
  export interface BinAssignmentManagerProps {
    bins: BinAssignment[]
    users: User[]
    onAssignUser: (binId: string, userId: string) => Promise<boolean>
    onUnassignUser: (binId: string, userId: string) => Promise<boolean>
  }
  
  