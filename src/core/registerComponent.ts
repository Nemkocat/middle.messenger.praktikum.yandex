import Block from "./block";
import Handlebars, { HelperOptions } from "handlebars";

export type PropsBlock = Record<string, unknown>;
// Используем unknown вместо any для типобезопасности

export interface BlockConstructable<P = PropsBlock> {
  new (tagName?: string, props?: P): Block;
}

// Функция для регистрации компонентов с любыми типами props
export default function registerComponent<Props extends Record<string, unknown> = PropsBlock>(
  Component: BlockConstructable<Props>,
) {
  Handlebars.registerHelper(
    Component.name,
    function (
    this: Props,
    { hash: { ref, ...hash }, data, fn }: HelperOptions,) {
      if (!data.root.children) {
        data.root.children = {};
      }

      if (!data.root.refs) {
        data.root.refs = {};
      }

      const { children, refs } = data.root;

      /**
       * Костыль для того, чтобы передавать переменные
       * внутрь блоков вручную подменяя значение
       */
      (Object.keys(hash) as Array<keyof Props>).forEach((key: keyof Props) => {
        // Используем явное приведение типа для Object.keys с generic типами
        // Пробуем получить значение из this (контекст родительского шаблона)
        // Если не найдено, пробуем из data.root (корневой контекст)
        const value = this[key] || (data.root as Record<string, unknown>)[String(key)];
        const hashValue = hash[key];
        if (value && typeof value === "string" && typeof hashValue === "string") {
          hash[key] = hashValue.replace(
            new RegExp(`{{${String(key)}}}`, "i"),
            value,
          ) as Props[keyof Props];
        }
      });

      const component = new Component('div', hash);

      // Prevent using null as index type
      if (component.id != null) {
        children[component.id as string] = component;
      }

      if (ref) {
        refs[ref] = component.getContent();
      }

      const contents = fn ? fn(this) : "";

      return `<div data-id="${component.id}">${contents}</div>`;
    }
  )
}

