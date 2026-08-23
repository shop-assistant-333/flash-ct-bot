import { useState } from 'react'
import type { FormEvent } from 'react'

import type { UserRole } from '@/shared/api'
import { errorProp, fieldErrors } from '@/shared/lib/form-errors'
import { Button } from '@/shared/ui/button'
import { SelectField } from '@/shared/ui/select-field'
import { TextField } from '@/shared/ui/text-field'

import type { AdminUserItem, UserRequest } from '../api/admin-users-api'

interface UserFormProps {
  /** Undefined on the "new user" screen; otherwise the values to start from. */
  user?: AdminUserItem
  submitLabel: string
  onSubmit: (body: UserRequest) => void
  saving?: boolean
  /** Failure of the surrounding mutation, laid out over the fields. */
  error?: unknown
}

const ROLE_OPTIONS = [
  { value: 'USER', label: 'Ученик' },
  { value: 'TEACHER', label: 'Учитель' },
  { value: 'ADMIN', label: 'Администратор' },
] as const

const ROLES: readonly UserRole[] = ROLE_OPTIONS.map((option) => option.value)

/** `<select>` hands back a bare string, so the role is narrowed against the options. */
function toRole(value: string): UserRole {
  return ROLES.find((role) => role === value) ?? 'USER'
}

const TEACHER_HINT = 'Предмет учителю выдаётся ниже, в блоке «Преподаёт»'

const TG_ID_HINT = 'Можно не заполнять: id подставится сам, когда ученик впервые откроет мини-апп'

export function UserForm({ user, submitLabel, onSubmit, saving = false, error }: UserFormProps) {
  const [username, setUsername] = useState(user?.username ?? '')
  const [tgId, setTgId] = useState(user?.tgId ?? '')
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [role, setRole] = useState<UserRole>(user?.role ?? 'USER')
  const [usernameError, setUsernameError] = useState('')

  const fields = fieldErrors(error)
  const hasFieldError = Object.keys(fields).length > 0
  const failed = error !== null && error !== undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUsername = username.trim()
    if (trimmedUsername === '') {
      setUsernameError('Укажите username')
      return
    }

    setUsernameError('')

    const trimmedTgId = tgId.trim()
    onSubmit({
      username: trimmedUsername,
      // An empty telegram id is not "no change": the backend fills it in itself
      // on the student's first launch, so the key is left out entirely.
      ...(trimmedTgId === '' ? {} : { tgId: trimmedTgId }),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TextField
        label="Username"
        value={username}
        onChange={setUsername}
        required
        placeholder="ivanov"
        {...errorProp(fields.username ?? usernameError)}
      />
      <TextField
        label="Telegram id"
        value={tgId}
        onChange={setTgId}
        hint={TG_ID_HINT}
        {...errorProp(fields.tgId)}
      />
      <TextField
        label="Имя"
        value={firstName}
        onChange={setFirstName}
        {...errorProp(fields.firstName)}
      />
      <TextField
        label="Фамилия"
        value={lastName}
        onChange={setLastName}
        {...errorProp(fields.lastName)}
      />
      <SelectField
        label="Роль"
        value={role}
        options={[...ROLE_OPTIONS]}
        onChange={(value) => setRole(toRole(value))}
        {...(role === 'TEACHER' ? { hint: TEACHER_HINT } : {})}
        {...errorProp(fields.role)}
      />

      {failed && !hasFieldError ? (
        <p className="text-sm text-danger">Не удалось сохранить. Попробуйте ещё раз</p>
      ) : null}

      <Button type="submit" loading={saving}>
        {submitLabel}
      </Button>
    </form>
  )
}
