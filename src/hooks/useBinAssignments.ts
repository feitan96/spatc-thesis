"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebaseConfig"
import type { BinAssignment } from "../types/userManagement"

export function useBinAssignments() {
  const [bins, setBins] = useState<BinAssignment[]>([])
  const [isLoadingBins, setIsLoadingBins] = useState(false)

  const fetchBins = useCallback(async () => {
    setIsLoadingBins(true)
    try {
      const querySnapshot = await getDocs(collection(db, "binAssignments"))
      const fetchedBins: BinAssignment[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedBins.push({
          id: doc.id,
          bin: data.bin,
          assignee: data.assignee || [],
        })
      })
      setBins(fetchedBins)
    } catch (error) {
      console.error("Error fetching bins: ", error)
    } finally {
      setIsLoadingBins(false)
    }
  }, [])

  const assignUserToBin = async (binId: string, userId: string) => {
    setIsLoadingBins(true)
    try {
      const selectedBin = bins.find((bin) => bin.id === binId)
      if (selectedBin) {
        const binDocRef = doc(db, "binAssignments", selectedBin.id)
        await updateDoc(binDocRef, {
          assignee: [...selectedBin.assignee, userId],
        })
        await fetchBins() // Refresh bins after update
        return true
      }
      return false
    } catch (error) {
      console.error("Error assigning user: ", error)
      return false
    } finally {
      setIsLoadingBins(false)
    }
  }

  const unassignUserFromBin = async (binId: string, userId: string) => {
    setIsLoadingBins(true)
    try {
      const selectedBin = bins.find((bin) => bin.id === binId)
      if (selectedBin) {
        const binDocRef = doc(db, "binAssignments", selectedBin.id)
        const updatedAssignee = selectedBin.assignee.filter((id) => id !== userId)
        await updateDoc(binDocRef, {
          assignee: updatedAssignee,
        })
        await fetchBins() // Refresh bins after update
        return true
      }
      return false
    } catch (error) {
      console.error("Error unassigning user: ", error)
      return false
    } finally {
      setIsLoadingBins(false)
    }
  }

  useEffect(() => {
    fetchBins()
  }, [fetchBins])

  return {
    bins,
    isLoadingBins,
    assignUserToBin,
    unassignUserFromBin,
    refreshBins: fetchBins,
  }
}

