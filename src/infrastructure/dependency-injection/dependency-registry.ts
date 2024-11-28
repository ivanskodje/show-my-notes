type DependencyKey = string;

class DependencyRegistry {
  private dependencies = new Map<DependencyKey, unknown>();

  register<T>(key: DependencyKey, instance: T): void {
    if (this.dependencies.has(key)) {
      throw new Error(`Dependency with key "${key}" is already registered.`);
    }
    this.dependencies.set(key, instance);
  }

  resolve<T>(key: DependencyKey): T {
    const dependency = this.dependencies.get(key);
    if (!dependency) {
      throw new Error(`Dependency with key "${key}" is not registered.`);
    }
    return dependency as T;
  }
}

export const dependencyRegistry = new DependencyRegistry();
