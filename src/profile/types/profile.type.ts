import { UserType } from '@app/user/types/user.type'

export type ProfileType = {
	profile: Omit<UserType, 'password, email'> & { following: boolean };
}