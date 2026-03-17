import useRealtimeAnalytics from '../hooks/useRealtimeAnalytics'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardTopbar from '../components/dashboard/DashboardTopbar'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import Globe from '../components/dashboard/Globe'
import ActiveUsersCounter from '../components/dashboard/ActiveUsersCounter'
import StatsGrid from '../components/dashboard/StatsGrid'
import ActivityTimeline from '../components/dashboard/ActivityTimeline'
import TopPages from '../components/dashboard/TopPages'
import UsersByCountry from '../components/dashboard/UsersByCountry'

export default function DashboardPage() {
  const { data, isConnected, previousActiveUsers } = useRealtimeAnalytics()

  return (
    <DashboardLayout
      topbar={
        <DashboardTopbar
          isConnected={isConnected}
          activeUsers={data.stats.activeUsers}
        />
      }
      sidebar={<DashboardSidebar />}
      main={
        <>
          <Globe points={data.globePoints} />
          <StatsGrid stats={data.stats} />
          <ActivityTimeline events={data.recentActivity} />
        </>
      }
      rightRail={
        <>
          <ActiveUsersCounter
            count={data.stats.activeUsers}
            previousCount={previousActiveUsers}
          />
          <TopPages pages={data.topPages} />
          <UsersByCountry countries={data.topCountries} />
        </>
      }
    />
  )
}
