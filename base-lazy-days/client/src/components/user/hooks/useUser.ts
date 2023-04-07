/* eslint-disable */
import { AxiosResponse } from 'axios';
import { useEffect } from 'react';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

import { useQuery, useQueryClient } from '@tanstack/react-query';

async function getUser(
  user: User | null,
  signal: AbortSignal,
): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      headers: getJWTHeader(user),
      signal,
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

  // THIS WILL KEEP RUN TO KEEP THE USER DATA UPDATED
  // IT LOOK INTO THE CACHE DATA THAT IS ALREADY FILL WITH DATA FROM updateUser() AFTER USER LOGIN
  const { data: user } = useQuery({
    initialData: getStoredUser(),
    queryKey: [queryKeys.user],
    queryFn: ({ signal }) => getUser(user, signal),
  });

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // TODO: update the user in the query cache

    queryClient.setQueryData([queryKeys.user], newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    // reset user to null in query cache
    queryClient.setQueryData([queryKeys.user], null);

    // remove the query with the key ('user-appointments')
    queryClient.removeQueries([queryKeys.appointments, queryKeys.user]);
  }

  useEffect(() => {
    if (!user) {
      // if there's not user, clear the localstorage
      clearStoredUser();
    } else {
      // else, update the localstorage with the updated user data
      setStoredUser(user);
    }
  }, [user]); // if user changes

  return { user, updateUser, clearUser };
}
