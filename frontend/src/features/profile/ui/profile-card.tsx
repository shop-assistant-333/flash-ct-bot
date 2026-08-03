import type { ProfileDto } from '../api/profile-api'

interface ProfileCardProps {
  profile: ProfileDto
}

function getInitials(firstName: string, lastName: string, username: string): string {
  const initials = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.trim()
  return initials !== '' ? initials.toUpperCase() : username.charAt(0).toUpperCase()
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const fullName = `${profile.firstName} ${profile.lastName ? profile.lastName : ""}`.trim()

  return (
    <div className="flex items-center gap-4 rounded-card bg-surface p-4 shadow-card">
      <span
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary-soft-fg"
      >
        {getInitials(profile.firstName, profile.lastName, profile.username)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-lg font-semibold text-fg">
          {fullName !== '' ? fullName : profile.username}
        </span>
        <span className="truncate text-sm text-muted">@{profile.username}</span>
      </div>
    </div>
  )
}
