/**
 * Base interface for all Model classes
 * Models represent domain entities and business rules
 */
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base interface for Model validation
 */
export interface ModelValidator<T> {
  validate(model: T): ModelValidationResult;
}

/**
 * Result of model validation
 */
export interface ModelValidationResult {
  isValid: boolean;
  errors: ModelValidationError[];
}

/**
 * Individual validation error
 */
export interface ModelValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Base abstract class for domain models with validation
 */
export abstract class DomainModel implements BaseModel {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<BaseModel> = {}) {
    this.id = data.id || this.generateId();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Generate unique ID for the model
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update the model's timestamp
   */
  public touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Create a copy of the model with updated fields
   */
  public update(updates: Partial<this>): this {
    const updated = Object.assign(Object.create(Object.getPrototypeOf(this)), this, updates);
    updated.touch();
    return updated;
  }

  /**
   * Convert model to plain object for serialization
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      ...this.serialize(),
    };
  }

  /**
   * Validate the model using business rules
   */
  public validate(): ModelValidationResult {
    const errors: ModelValidationError[] = [];

    // Base validation
    if (!this.id) {
      errors.push({
        field: 'id',
        message: 'ID is required',
        code: 'REQUIRED',
      });
    }

    if (!this.createdAt) {
      errors.push({
        field: 'createdAt',
        message: 'Created date is required',
        code: 'REQUIRED',
      });
    }

    // Custom validation from subclasses
    const customValidation = this.validateModel();
    errors.push(...customValidation);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if model satisfies business rule
   */
  public satisfies(rule: BusinessRule<this>): boolean {
    return rule.isSatisfiedBy(this);
  }

  // Abstract methods to be implemented by concrete models
  protected abstract serialize(): Record<string, any>;
  protected abstract validateModel(): ModelValidationError[];
}

/**
 * Business rule interface for domain logic
 */
export interface BusinessRule<T> {
  isSatisfiedBy(model: T): boolean;
  getErrorMessage(): string;
}

/**
 * Composite business rule for combining multiple rules
 */
export class CompositeBusinessRule<T> implements BusinessRule<T> {
  constructor(private rules: BusinessRule<T>[]) {}

  isSatisfiedBy(model: T): boolean {
    return this.rules.every(rule => rule.isSatisfiedBy(model));
  }

  getErrorMessage(): string {
    const failedRules = this.rules.filter(rule => !rule.isSatisfiedBy({} as T));
    return failedRules.map(rule => rule.getErrorMessage()).join(', ');
  }
}

/**
 * Factory interface for creating models
 */
export interface ModelFactory<T extends DomainModel> {
  create(data: any): T;
  createFromJSON(json: string): T;
}

/**
 * Repository interface for data access
 */
export interface Repository<T extends BaseModel> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(model: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}
