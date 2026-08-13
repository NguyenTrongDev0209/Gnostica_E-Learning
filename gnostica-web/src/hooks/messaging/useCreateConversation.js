import { useMutation, useQueryClient } from '@tanstack/react-query';
import messagingService from '@/services/messaging/messagingService';
import { messagingKeys } from '@/lib/messaging/messagingQueryKeys';

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  const studentMutation = useMutation({
    mutationFn: (courseId) => messagingService.createConversationForStudent(courseId),
    onSuccess: (data) => {
      if (data?.id) {
        queryClient.setQueryData(messagingKeys.conversation(data.id), data);
      }
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
    },
  });

  const instructorMutation = useMutation({
    mutationFn: ({ courseId, studentId }) =>
      messagingService.createConversationForInstructor(courseId, studentId),
    onSuccess: (data) => {
      if (data?.id) {
        queryClient.setQueryData(messagingKeys.conversation(data.id), data);
      }
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
    },
  });

  return {
    createForStudent: studentMutation.mutateAsync,
    isCreatingStudent: studentMutation.isPending,
    studentError: studentMutation.error,

    createForInstructor: instructorMutation.mutateAsync,
    isCreatingInstructor: instructorMutation.isPending,
    instructorError: instructorMutation.error,
  };
};
