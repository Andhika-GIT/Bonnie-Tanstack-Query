/* eslint-disable */
import { AxiosResponse } from 'axios';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

import { useQuery, useQueryClient } from '@tanstack/react-query';

async function getUser(user: User | null): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      headers: getJWTHeader(user),
    },
  );
  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  const queryClient = useQueryClient();
  // TODO: call useQuery to update user data from server

  // THIS IS ONLY RUN AFTER USER SIGN IN OR AFTER updateUser RUN IN LOGIN PROCESS
  // IT LOOK INTO THE CACHE DATA THAT IS ALREADY FILL WITH DATA FROM updateUser()
  const { data: user } = useQuery({
    queryKey: [queryKeys.user],
    queryFn: () => getUser(user),
  });

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // TODO: update the user in the query cache

    queryClient.setQueryData([queryKeys.user], newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    // TODO: reset user to null in query cache
    queryClient.setQueryData([queryKeys.user], null);
  }

  return { user, updateUser, clearUser };
}
