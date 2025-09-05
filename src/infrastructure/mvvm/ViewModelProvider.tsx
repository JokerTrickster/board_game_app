import React, { createContext, useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { BaseViewModel } from './BaseViewModel';

/**
 * Context for providing ViewModels to React components
 */
interface ViewModelContextValue {
  getViewModel: <T extends BaseViewModel>(key: string) => T;
  setViewModel: <T extends BaseViewModel>(key: string, viewModel: T) => void;
  removeViewModel: (key: string) => void;
}

const ViewModelContext = createContext<ViewModelContextValue | null>(null);

/**
 * Provider component for managing ViewModels
 */
interface ViewModelProviderProps {
  children: React.ReactNode;
}

export const ViewModelProvider: React.FC<ViewModelProviderProps> = ({ children }) => {
  const viewModelsRef = useRef<Map<string, BaseViewModel>>(new Map());

  const contextValue: ViewModelContextValue = {
    getViewModel: <T extends BaseViewModel>(key: string): T => {
      const viewModel = viewModelsRef.current.get(key);
      if (!viewModel) {
        throw new Error(`ViewModel with key '${key}' not found`);
      }
      return viewModel as T;
    },

    setViewModel: <T extends BaseViewModel>(key: string, viewModel: T): void => {
      // Cleanup existing ViewModel if present
      const existingViewModel = viewModelsRef.current.get(key);
      if (existingViewModel) {
        existingViewModel.cleanup();
      }

      viewModelsRef.current.set(key, viewModel);
      
      // Initialize the new ViewModel
      viewModel.initialize().catch(error => {
        console.error(`Failed to initialize ViewModel '${key}':`, error);
      });
    },

    removeViewModel: (key: string): void => {
      const viewModel = viewModelsRef.current.get(key);
      if (viewModel) {
        viewModel.cleanup();
        viewModelsRef.current.delete(key);
      }
    },
  };

  // Cleanup all ViewModels on unmount
  useEffect(() => {
    return () => {
      for (const [key, viewModel] of viewModelsRef.current) {
        viewModel.cleanup();
      }
      viewModelsRef.current.clear();
    };
  }, []);

  return (
    <ViewModelContext.Provider value={contextValue}>
      {children}
    </ViewModelContext.Provider>
  );
};

/**
 * Hook to access ViewModels from context
 */
export const useViewModelContext = (): ViewModelContextValue => {
  const context = useContext(ViewModelContext);
  if (!context) {
    throw new Error('useViewModelContext must be used within a ViewModelProvider');
  }
  return context;
};

/**
 * Hook to use a specific ViewModel
 */
export function useViewModel<T extends BaseViewModel>(
  key: string,
  factory: () => T,
  deps: any[] = []
): T {
  const context = useViewModelContext();
  const viewModel = useRef<T | null>(null);

  useEffect(() => {
    // Create and register ViewModel
    const vm = factory();
    viewModel.current = vm;
    context.setViewModel(key, vm);

    // Cleanup on unmount or dependency change
    return () => {
      if (viewModel.current) {
        context.removeViewModel(key);
        viewModel.current = null;
      }
    };
  }, deps);

  return context.getViewModel<T>(key);
}

/**
 * HOC to inject ViewModel into component props
 */
export function withViewModel<P extends object, T extends BaseViewModel>(
  key: string,
  factory: () => T,
  deps: any[] = []
) {
  return function <C extends React.ComponentType<P & { viewModel: T }>>(
    Component: C
  ): React.FC<P> {
    const WrappedComponent: React.FC<P> = (props) => {
      const viewModel = useViewModel(key, factory, deps);
      return <Component {...props} viewModel={viewModel} />;
    };

    WrappedComponent.displayName = `withViewModel(${Component.displayName || Component.name})`;
    
    return observer(WrappedComponent);
  };
}

/**
 * Hook for creating a ViewModel instance with automatic cleanup
 */
export function useViewModelInstance<T extends BaseViewModel>(
  factory: () => T,
  deps: any[] = []
): T {
  const viewModelRef = useRef<T | null>(null);

  useEffect(() => {
    // Create ViewModel
    const vm = factory();
    viewModelRef.current = vm;

    // Initialize
    vm.initialize().catch(error => {
      console.error('Failed to initialize ViewModel:', error);
    });

    // Cleanup on unmount or dependency change
    return () => {
      if (viewModelRef.current) {
        viewModelRef.current.cleanup();
        viewModelRef.current = null;
      }
    };
  }, deps);

  if (!viewModelRef.current) {
    // Create temporary instance for first render
    viewModelRef.current = factory();
  }

  return viewModelRef.current;
}

/**
 * Component wrapper that automatically observes ViewModel changes
 */
export function ObserverComponent<P extends { viewModel: BaseViewModel }>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return observer(Component);
}

/**
 * Higher-order component for ViewModel management
 */
export interface ViewModelComponentProps<T extends BaseViewModel> {
  viewModel: T;
}

export function createViewModelComponent<
  T extends BaseViewModel,
  P extends ViewModelComponentProps<T>
>(
  ViewModelClass: new (...args: any[]) => T,
  Component: React.ComponentType<P>,
  options: {
    key?: string;
    dependencies?: any[];
    autoObserve?: boolean;
  } = {}
): React.FC<Omit<P, 'viewModel'>> {
  const { key = ViewModelClass.name, dependencies = [], autoObserve = true } = options;

  const WrappedComponent: React.FC<Omit<P, 'viewModel'>> = (props) => {
    const viewModel = useViewModel(
      key,
      () => new ViewModelClass(),
      dependencies
    );

    const ComponentToRender = autoObserve ? observer(Component) : Component;
    
    return <ComponentToRender {...(props as P)} viewModel={viewModel} />;
  };

  WrappedComponent.displayName = `ViewModelComponent(${Component.displayName || Component.name})`;

  return WrappedComponent;
}