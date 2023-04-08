/* eslint-disable */
import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';

import {
  useMutation,
  UseMutateFunction,
  useQueryClient,
} from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { queryKeys } from 'react-query/constants';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useToast();
  const queryClient = useQueryClient();

  // TODO: replace with mutate function
  const { mutate: patchUser } = useMutation({
    mutationFn: (newData: User) => patchUserOnServer(newData, user),

    onMutate: async (newData: User | null) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [queryKeys.user] });

      //  save snapshot of previous user value
      const previousUserData: User = queryClient.getQueryData([queryKeys.user]);

      // optimistically update the cache with new user value
      queryClient.setQueryData([queryKeys.user], newData);

      // Return a context with the previous and new todo
      return { previousUserData };
    },
    onError: (error, newData, context) => {
      // roll back cache to saved value

      if (context.previousUserData) {
        queryClient.setQueryData([queryKeys.user], context.previousUserData);
        toast({
          title: `update failed : ${error}, restoring previous values`,
          status: 'warning',
        });
      }
    },
    onSuccess: (userData: User | null) => {
      // userData -> the result from patchUserOnServer(newData,user) when calling useMutation
      if (userData) {
        updateUser(userData);
        toast({
          title: 'User sucessfully updated!',
          status: 'success',
        });
      }
    },
    onSettled: () => {
      // invalidate user query to get the latest data from server
      queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
    },
  });

  return patchUser;
}
