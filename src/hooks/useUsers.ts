"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebaseConfig"
import type { User } from "../types/userManagement"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true)
    try {
      const querySnapshot = await getDocs(collection(db, "users"))
      const fetchedUsers: User[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.role === "user" && !data.isDeleted) {
          fetchedUsers.push({
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            contactNumber: data.contactNumber,
            address: data.address,
            isDeleted: data.isDeleted,
          })
        }
      })
      setUsers(fetchedUsers)
    } catch (error) {
      console.error("Error fetching users: ", error)
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  const softDeleteUser = async (userId: string) => {
    setIsLoadingUsers(true)
    try {
      const userDocRef = doc(db, "users", userId)
      await updateDoc(userDocRef, { isDeleted: true })
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
      return true
    } catch (error) {
      console.error("Error soft deleting user: ", error)
      return false
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    isLoadingUsers,
    softDeleteUser,
    refreshUsers: fetchUsers,
  }
}

