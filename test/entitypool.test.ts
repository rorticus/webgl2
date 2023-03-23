import { describe, it, expect } from "vitest";
import { EntityPool } from "../src/engine/entities";

const SymbolA = Symbol();
const SymbolB = Symbol();

interface TestPool {
  [SymbolA]: { a: true };
  [SymbolB]: { b: true };
}

describe("EntityPool", () => {
  it("should be able to add an entity", () => {
    const pool = new EntityPool<TestPool>();

    const entity = pool.add({ [SymbolA]: { a: true } });
    expect(entity.entity).toEqual(1);
    expect(entity.component(SymbolA)).toEqual({ a: true });
  });

  it("should get entities by a single component", () => {
    const pool = new EntityPool<TestPool>();

    const entity1 = pool.add({
      [SymbolA]: { a: true },
      [SymbolB]: { b: true },
    });
    const entity2 = pool.add({ [SymbolB]: { b: true } });

    const results = pool.withComponents(SymbolB);

    expect(results).toHaveLength(2);
    expect(results[0].entity).toEqual(entity1.entity);
    expect(results[1].entity).toEqual(entity2.entity);
  });

  it("should get entities by multiple components", () => {
    const pool = new EntityPool<TestPool>();

    pool.add({ [SymbolA]: { a: true } });
    const entity2 = pool.add({ [SymbolA]: { a: true }, [SymbolB]: { b: true } });

    const results = pool.withComponents(SymbolA, SymbolB);

    expect(results).toHaveLength(1);
    expect(results[0].entity).toEqual(entity2.entity);
  });
});
