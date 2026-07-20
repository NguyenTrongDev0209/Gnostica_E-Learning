import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSettings,
  getPublicSiteConfig,
  updateAdminSettings,
  uploadSettingImage,
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanners,
  getPublicBanners,
  updateAdminBanner,
  createAdminPage,
  deleteAdminPage,
  getAdminPages,
  getPublicPage,
  updateAdminPage,
} from "@/services/settings/settingsService";

export const SITE_CONFIG_QUERY_KEY = ["site-config"];
export const ADMIN_SETTINGS_QUERY_KEY = ["admin", "settings"];
export const ADMIN_BANNERS_QUERY_KEY = ["admin", "banners"];
export const ADMIN_PAGES_QUERY_KEY = ["admin", "pages"];

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

export function usePublicBanners(position) {
  return useQuery({
    queryKey: ["public", "banners", position],
    queryFn: () => getPublicBanners(position),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useAdminBanners() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_BANNERS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["public", "banners"] });
  };
  const query = useQuery({ queryKey: ADMIN_BANNERS_QUERY_KEY, queryFn: getAdminBanners });
  const createMutation = useMutation({ mutationFn: createAdminBanner, onSuccess: refresh });
  const updateMutation = useMutation({ mutationFn: updateAdminBanner, onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: deleteAdminBanner, onSuccess: refresh });
  const uploadMutation = useMutation({ mutationFn: uploadSettingImage });
  return { ...query, createMutation, updateMutation, deleteMutation, uploadMutation };
}

export function usePublicPage(slug) {
  return useQuery({
    queryKey: ["public", "page", slug],
    queryFn: () => getPublicPage(slug),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useAdminPages() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_PAGES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["public", "page"] });
  };
  const query = useQuery({ queryKey: ADMIN_PAGES_QUERY_KEY, queryFn: getAdminPages });
  const createMutation = useMutation({ mutationFn: createAdminPage, onSuccess: refresh });
  const updateMutation = useMutation({ mutationFn: updateAdminPage, onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: deleteAdminPage, onSuccess: refresh });
  return { ...query, createMutation, updateMutation, deleteMutation };
}
