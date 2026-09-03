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
  getPublicTermsMenu,
  getPublicTerm,
  updateAdminPage,
  getAdminTerms,
  createAdminTermModule,
  updateAdminTermModule,
  deleteAdminTermModule,
  createAdminTerm,
  updateAdminTerm,
  deleteAdminTerm,
  getGlobalCommissions,
  getActiveCommission,
  createCommission,
  notifyCommission,
  updateCommission,
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

export function usePublicPage(slug, options = {}) {
  return useQuery({
    queryKey: ["public", "page", slug],
    queryFn: () => getPublicPage(slug),
    staleTime: 5 * 60_000,
    retry: (failureCount, error) => error?.response?.status !== 404 && failureCount < 1,
    ...options,
  });
}

export function usePublicTermsMenu() {
  return useQuery({
    queryKey: ["public", "terms-menu"],
    queryFn: getPublicTermsMenu,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function usePublicTerm(path) {
  const cleanPath = (path || "").replace(/^\/+/, "");
  return useQuery({
    queryKey: ["public", "term", cleanPath],
    queryFn: () => getPublicTerm(cleanPath),
    enabled: !!cleanPath && cleanPath !== "terms" && cleanPath !== "terms/",
    staleTime: 5 * 60_000,
    retry: (failureCount, error) => error?.response?.status !== 404 && failureCount < 1,
  });
}

export function useAdminPages() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_PAGES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["public", "page"] });
    queryClient.invalidateQueries({ queryKey: ["public", "terms-menu"] });
  };
  const query = useQuery({ queryKey: ADMIN_PAGES_QUERY_KEY, queryFn: getAdminPages });
  const createMutation = useMutation({ mutationFn: createAdminPage, onSuccess: refresh });
  const updateMutation = useMutation({ mutationFn: updateAdminPage, onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: deleteAdminPage, onSuccess: refresh });
  return { ...query, createMutation, updateMutation, deleteMutation };
}

export function useAdminTerms() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "terms"] });
    queryClient.invalidateQueries({ queryKey: ["public", "terms-menu"] });
    queryClient.invalidateQueries({ queryKey: ["public", "term"] });
  };
  const query = useQuery({ queryKey: ["admin", "terms"], queryFn: getAdminTerms });
  return {
    ...query,
    createModuleMutation: useMutation({ mutationFn: createAdminTermModule, onSuccess: refresh }),
    updateModuleMutation: useMutation({ mutationFn: updateAdminTermModule, onSuccess: refresh }),
    deleteModuleMutation: useMutation({ mutationFn: deleteAdminTermModule, onSuccess: refresh }),
    createTermMutation: useMutation({ mutationFn: createAdminTerm, onSuccess: refresh }),
    updateTermMutation: useMutation({ mutationFn: updateAdminTerm, onSuccess: refresh }),
    deleteTermMutation: useMutation({ mutationFn: deleteAdminTerm, onSuccess: refresh }),
  };
}

export function useCommissions() {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "commissions"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "commission-active"] });
  };

  const listQuery = useQuery({ queryKey: ["admin", "commissions"], queryFn: getGlobalCommissions });
  const activeQuery = useQuery({ queryKey: ["admin", "commission-active"], queryFn: getActiveCommission });
  
  const createMutation = useMutation({ mutationFn: createCommission, onSuccess: refresh });
  const notifyMutation = useMutation({ mutationFn: notifyCommission, onSuccess: refresh });
  const updateMutation = useMutation({ mutationFn: ({ id, formData }) => updateCommission(id, formData), onSuccess: refresh });

  return { listQuery, activeQuery, createMutation, notifyMutation, updateMutation };
}
