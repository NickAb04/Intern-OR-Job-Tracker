import { create } from "zustand";

interface PendingPin {
  latitude: number;
  longitude: number;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  selectedApplicationId: string | null;
  openSidebar: (applicationId: string) => void;
  closeSidebar: () => void;

  // Floating list
  floatingListCollapsed: boolean;
  toggleFloatingList: () => void;
  setFloatingListCollapsed: (collapsed: boolean) => void;

  // Map pin creation mode
  isAddingPin: boolean;
  setIsAddingPin: (adding: boolean) => void;
  pendingPin: PendingPin | null;
  setPendingPin: (pin: PendingPin | null) => void;

  // Create dialog (triggered from map click)
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  sidebarOpen: false,
  selectedApplicationId: null,
  openSidebar: (applicationId: string) =>
    set({ sidebarOpen: true, selectedApplicationId: applicationId }),
  closeSidebar: () =>
    set({ sidebarOpen: false, selectedApplicationId: null }),

  // Floating list
  floatingListCollapsed: false,
  toggleFloatingList: () =>
    set((state) => ({ floatingListCollapsed: !state.floatingListCollapsed })),
  setFloatingListCollapsed: (collapsed: boolean) =>
    set({ floatingListCollapsed: collapsed }),

  // Map pin creation mode
  isAddingPin: false,
  setIsAddingPin: (adding: boolean) => set({ isAddingPin: adding }),
  pendingPin: null,
  setPendingPin: (pin: PendingPin | null) => set({ pendingPin: pin }),

  // Create dialog
  createDialogOpen: false,
  setCreateDialogOpen: (open: boolean) => set({ createDialogOpen: open }),
}));
