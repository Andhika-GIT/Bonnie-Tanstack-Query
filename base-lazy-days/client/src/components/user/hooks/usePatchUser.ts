/* eslint-disable */
import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';

import { useMutation, UseMutateFunction } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';

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
export function usePatchUser(): (newData: User | null) => void {
  const { user, updateUser } = useUser();
  const toast = useToast();

  // TODO: replace with mutate function
  const { mutate: patchUser } = useMutation(
    (newData: User) => patchUserOnServer(newData, user),
    {
      // userData -> the result from patchUserOnServer(newData,user) when calling useMutation
      onSuccess: (userData: User | null) => {
        if (userData) {
          updateUser(userData);
          toast({
            title: 'User sucessfully updated!',
            status: 'success',
          });
        }
      },
    },
  );

  return patchUser;
}
