import { FontAwesome5 } from "@expo/vector-icons"
import { colors } from "../../src/styles/styles"
import BaseBottomBar from "./navigation/BaseBottomBar"

const AdminBottomBar = () => {
  const tabs = [
    {
      icon: <FontAwesome5 name="home" size={22} color={colors.primary} />,
      label: "Dashboard",
      path: "/admin/Dashboard",
    },
    {
      icon: <FontAwesome5 name="users" size={22} color={colors.primary} />,
      label: "Users",
      path: "/admin/UserManagement",
    },
    {
      icon: <FontAwesome5 name="trash-alt" size={22} color={colors.primary} />,
      label: "Bins",
      path: "/shared/BinList",
    },
    {
      icon: <FontAwesome5 name="chart-bar" size={22} color={colors.primary} />,
      label: "Analytics",
      path: "/admin/Analytics",
    },
    {
      icon: <FontAwesome5 name="cog" size={22} color={colors.primary} />,
      label: "Settings",
      path: "/shared/Settings",
    },
  ]

  return <BaseBottomBar tabs={tabs} />
}

export default AdminBottomBar

