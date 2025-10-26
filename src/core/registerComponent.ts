import Block from "./block";
import Handlebars, { HelperOptions } from "handlebars";

type PropsBlock = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
// Используем any здесь, так как props могут содержать любые типы данных

interface BlockConstructable<P = PropsBlock> {
  new (props: P): Block;
}

export default function registerComponent<Props extends PropsBlock = PropsBlock>(
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
      (Object.keys(hash) as any).forEach((key: keyof Props) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Используем any здесь из-за сложности типизации Object.keys с generic типами
        if (this[key] && typeof this[key] === "string") {
          hash[key] = hash[key].replace(
            new RegExp(`{{${String(key)}}}`, "i"),
            this[key],
          );
        }
      });

      const component = new Component(hash);

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

