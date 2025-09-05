import { observable, action, makeObservable, runInAction } from 'mobx';

/**
 * Base ViewModel class providing common functionality for all ViewModels
 * Implements standard patterns for state management, loading states, and error handling
 */
export abstract class BaseViewModel {
  // Common state properties
  @observable public isLoading: boolean = false;
  @observable public error: string | null = null;
  @observable public isInitialized: boolean = false;

  constructor() {
    makeObservable(this);
  }

  /**
   * Initialize the ViewModel
   * Should be called when the ViewModel is first created
   */
  @action
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.setLoading(true);
      this.clearError();
      await this.onInitialize();
      this.setInitialized(true);
    } catch (error) {
      this.handleError(error as Error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Cleanup resources when ViewModel is destroyed
   * Should be called when the component unmounts
   */
  @action
  public cleanup(): void {
    try {
      this.onCleanup();
    } catch (error) {
      console.warn('Error during ViewModel cleanup:', error);
    }
  }

  /**
   * Set loading state
   */
  @action
  protected setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  /**
   * Set error state
   */
  @action
  protected setError(error: string | null): void {
    this.error = error;
  }

  /**
   * Clear error state
   */
  @action
  protected clearError(): void {
    this.error = null;
  }

  /**
   * Set initialized state
   */
  @action
  protected setInitialized(initialized: boolean): void {
    this.isInitialized = initialized;
  }

  /**
   * Handle errors in a consistent way
   */
  @action
  protected handleError(error: Error): void {
    console.error(`${this.constructor.name} error:`, error);
    this.setError(error.message);
    this.onError(error);
  }

  /**
   * Execute async action with loading state and error handling
   */
  protected async executeAsync<T>(
    action: () => Promise<T>,
    options?: {
      showLoading?: boolean;
      clearError?: boolean;
    }
  ): Promise<T | null> {
    const { showLoading = true, clearError = true } = options || {};

    try {
      if (showLoading) this.setLoading(true);
      if (clearError) this.clearError();
      
      return await action();
    } catch (error) {
      this.handleError(error as Error);
      return null;
    } finally {
      if (showLoading) this.setLoading(false);
    }
  }

  /**
   * Update state safely within action
   */
  protected updateState(updater: () => void): void {
    runInAction(updater);
  }

  // Abstract methods to be implemented by concrete ViewModels
  protected abstract onInitialize(): Promise<void>;
  protected abstract onCleanup(): void;
  protected abstract onError(error: Error): void;
}