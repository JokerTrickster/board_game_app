/**
 * Dependency Injection Container for managing ViewModels and Services
 * Provides registration, resolution, and lifecycle management
 */

interface ServiceDescriptor {
  factory: (...args: any[]) => any;
  singleton: boolean;
  instance?: any;
  dependencies?: string[];
}

interface ServiceIdentifier<T = any> {
  name: string;
  type?: new (...args: any[]) => T;
}

/**
 * Simple Dependency Injection Container
 */
export class DIContainer {
  private services = new Map<string, ServiceDescriptor>();
  private instances = new Map<string, any>();

  /**
   * Register a service with the container
   */
  register<T>(
    identifier: string | ServiceIdentifier<T>,
    factory: (...args: any[]) => T,
    options: {
      singleton?: boolean;
      dependencies?: string[];
    } = {}
  ): void {
    const name = typeof identifier === 'string' ? identifier : identifier.name;
    const { singleton = true, dependencies = [] } = options;

    this.services.set(name, {
      factory,
      singleton,
      dependencies,
    });
  }

  /**
   * Register a class as a service
   */
  registerClass<T>(
    identifier: string | ServiceIdentifier<T>,
    ClassConstructor: new (...args: any[]) => T,
    options: {
      singleton?: boolean;
      dependencies?: string[];
    } = {}
  ): void {
    this.register(
      identifier,
      (...args: any[]) => new ClassConstructor(...args),
      options
    );
  }

  /**
   * Register a singleton instance
   */
  registerInstance<T>(
    identifier: string | ServiceIdentifier<T>,
    instance: T
  ): void {
    const name = typeof identifier === 'string' ? identifier : identifier.name;
    this.instances.set(name, instance);
    
    // Also register as a factory that returns the instance
    this.services.set(name, {
      factory: () => instance,
      singleton: true,
      instance,
    });
  }

  /**
   * Resolve a service from the container
   */
  resolve<T>(identifier: string | ServiceIdentifier<T>): T {
    const name = typeof identifier === 'string' ? identifier : identifier.name;
    
    // Check if we have a cached instance for singletons
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    const descriptor = this.services.get(name);
    if (!descriptor) {
      throw new Error(`Service '${name}' not registered`);
    }

    // Resolve dependencies
    const dependencies = descriptor.dependencies?.map(dep => this.resolve(dep)) || [];
    
    // Create instance
    const instance = descriptor.factory(...dependencies);

    // Cache singleton instances
    if (descriptor.singleton) {
      this.instances.set(name, instance);
      descriptor.instance = instance;
    }

    return instance;
  }

  /**
   * Check if service is registered
   */
  has(identifier: string | ServiceIdentifier): boolean {
    const name = typeof identifier === 'string' ? identifier : identifier.name;
    return this.services.has(name);
  }

  /**
   * Clear all services and instances
   */
  clear(): void {
    // Cleanup instances if they have cleanup methods
    for (const [, instance] of this.instances) {
      if (instance && typeof instance.cleanup === 'function') {
        try {
          instance.cleanup();
        } catch (error) {
          console.warn('Error during service cleanup:', error);
        }
      }
    }

    this.services.clear();
    this.instances.clear();
  }

  /**
   * Create a child container that inherits from this container
   */
  createChild(): DIContainer {
    const child = new DIContainer();
    
    // Copy services from parent (not instances, so child can have its own)
    for (const [name, descriptor] of this.services) {
      child.services.set(name, { ...descriptor });
    }

    return child;
  }

  /**
   * Get all registered service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }
}

/**
 * Global container instance
 */
export const globalContainer = new DIContainer();

/**
 * Service registration decorator
 */
export function Injectable(identifier?: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const serviceName = identifier || constructor.name;
    globalContainer.registerClass(serviceName, constructor);
    return constructor;
  };
}

/**
 * Dependency injection decorator for constructor parameters
 */
export function Inject(identifier: string) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    // Store metadata about injected dependencies
    const existingTokens = Reflect.getMetadata('inject:tokens', target) || [];
    existingTokens[parameterIndex] = identifier;
    Reflect.defineMetadata('inject:tokens', existingTokens, target);
  };
}

/**
 * Auto-resolve dependencies for a class
 */
export function resolveDependencies(constructor: new (...args: any[]) => any): any[] {
  const tokens = Reflect.getMetadata('inject:tokens', constructor) || [];
  return tokens.map((token: string) => globalContainer.resolve(token));
}

/**
 * Service locator pattern for easy access to services
 */
export class ServiceLocator {
  static resolve<T>(identifier: string | ServiceIdentifier<T>): T {
    return globalContainer.resolve(identifier);
  }

  static register<T>(
    identifier: string | ServiceIdentifier<T>,
    factory: (...args: any[]) => T,
    options?: { singleton?: boolean; dependencies?: string[] }
  ): void {
    globalContainer.register(identifier, factory, options);
  }

  static registerInstance<T>(
    identifier: string | ServiceIdentifier<T>,
    instance: T
  ): void {
    globalContainer.registerInstance(identifier, instance);
  }
}