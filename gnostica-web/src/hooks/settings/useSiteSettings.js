import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSettings,
  getPublicSiteConfig,
  updateAdminSettings,
  uploadSettingImage,
} from "@/services/settings/settingsService";

export const SITE_CONFIG_QUERY_KEY = ["site-config"];
export const ADMIN_SETTINGS_QUERY_KEY = ["admin", "settings"];

export function usePublicSiteConfig() {
  return useQuery({
    queryKey: SITE_CONFIG_QUERY_KEY,
    queryFn: getPublicSiteConfig,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useAdminSettings() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ADMIN_SETTINGS_QUERY_KEY,
    queryFn: getAdminSettings,
  });
  const updateMutation = useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(ADMIN_SETTINGS_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: SITE_CONFIG_QUERY_KEY });
    },
  });
  const uploadMutation = useMutation({ mutationFn: uploadSettingImage });

  return { ...query, updateMutation, uploadMutation };
}
