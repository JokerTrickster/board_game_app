// MVVM Infrastructure Exports
export { BaseViewModel } from './BaseViewModel';
export {
  type BaseModel,
  type ModelValidator,
  type ModelValidationResult,
  type ModelValidationError,
  type BusinessRule,
  type ModelFactory,
  type Repository,
  DomainModel,
  CompositeBusinessRule,
} from './BaseModel';

export {
  DIContainer,
  globalContainer,
  Injectable,
  Inject,
  resolveDependencies,
  ServiceLocator,
} from './DIContainer';

export {
  ViewModelProvider,
  useViewModelContext,
  useViewModel,
  useViewModelInstance,
  withViewModel,
  ObserverComponent,
  createViewModelComponent,
  type ViewModelComponentProps,
} from './ViewModelProvider';

// Re-export mobx essentials for convenience
export { observable, action, computed, runInAction, makeObservable } from 'mobx';
export { observer } from 'mobx-react-lite';
