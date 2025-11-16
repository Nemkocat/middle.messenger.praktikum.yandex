import EventBus from "./eventBus";
import Handlebars from "handlebars";

// Типы для Block
interface PropsBlock {
  [key: string]: unknown;
  // Используем unknown вместо any для типобезопасности
  // Props могут содержать любые типы данных (строки, числа, функции, объекты, компоненты и т.д.)
}

interface ChildrenBlock {
  [key: string]: Block | Block[];
}

// Нельзя создавать экземпляр данного класса
export default class Block {
  static EVENTS = {
    INIT: "init", // Инициализирован компонент
    MOUNT: "mount", // Вмонтирован в DOM
    UPDATE: "update", // Обновлен компонент
    RENDER: "render", // Перерисовка
    FLOW_CDM: "flow:component-did-mount",
    FLOW_CDU: "flow:component-did-update", 
    FLOW_RENDER: "flow:render",
  };

  _element: HTMLElement | null = null; // DOM-элемент компонента
  _meta: { tagName: string; props: PropsBlock } | null = null; // Метаданные
  _id: string | null = null; // Уникальный ID компонента
  children: ChildrenBlock = {}; // Дочерние компоненты
  props: PropsBlock = {}; // Свойства компонента
  eventBus: () => EventBus<string>; // EventBus для компонента - используем string вместо any


  // constructor - специальный метод класса, который вызывается при создании экземпляра через new (new Block())
  // Короче: Все что внутри выполниться при создании экземпляра
  constructor(tagName: string = "div", propsWithChildren: PropsBlock = {}) {
    const eventBus = new EventBus();
    this.eventBus = () => eventBus; // Зачем функция? Чтобы "спрятать" EventBus и дать доступ только через метод!
    // же в коде можно будет:
    // this.eventBus().emit("init");  <-- вызвать событие

    // Деструктуризация: 
    // Вместо:
    // const result = this._getChildrenAndProps(propsWithChildren);
    // const props = result.props;
    // const children = result.children;
    // Пишем:
    const { props, children } = this._getChildrenAndProps(propsWithChildren);


    this.children = children;

    this._meta = {
      tagName,
      props,
    };

    this.props = this._makePropsProxy(props);

    // Генерируем уникальный ID для компонента
    this._id = Math.random().toString(36).substr(2, 9);

    this._registerEvents(eventBus);
    eventBus.emit(Block.EVENTS.INIT);
  }

  _registerEvents(eventBus: EventBus<string>) {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDU, (...args: unknown[]) => {
      this._componentDidUpdate(args[0] as PropsBlock, args[1] as PropsBlock);
    });
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

    _createResources() {
      if (!this._meta) return;
      
      const { tagName, props } = this._meta;
      this._element = this._createDocumentElement(tagName);
      
      if (typeof props.className === "string") {
        const classes = props.className.split(" ").filter(Boolean);
        if (classes.length > 0) {
          this._element.classList.add(...classes);
        }
      }

      if (typeof props.attrs === "object" && props.attrs !== null) {
        Object.entries(props.attrs).forEach(([attrName, attrValue]) => {
          // Для disabled атрибута: если значение false, удаляем атрибут, иначе устанавливаем
          if (attrName === 'disabled') {
            if (attrValue === false || attrValue === 'false' || attrValue === '') {
              this._element!.removeAttribute('disabled');
            } else {
              this._element!.setAttribute(attrName, '');
            }
          } else {
          this._element!.setAttribute(attrName, String(attrValue));
          }
        });
      }
    }

    init() {
      this._createResources();
      this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
    }

  _getChildrenAndProps(propsAndChildren: PropsBlock): { children: ChildrenBlock; props: PropsBlock } {
    const children: ChildrenBlock = {};
    const props: PropsBlock = {};

    Object.entries(propsAndChildren).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((obj) => {
          if (obj instanceof Block) {
            children[key] = value;
          } else {
            props[key] = value;
          }
        });

        return;
      }
      if (value instanceof Block) {
        children[key] = value;
      } else {
        props[key] = value;
      }
    });

    return { children, props };
  }

  _componentDidMount() {
    this.componentDidMount();
  }

  componentDidMount(_oldProps?: PropsBlock) {} // eslint-disable-line @typescript-eslint/no-unused-vars

  dispatchComponentDidMount() {
    this.eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  _componentDidUpdate(oldProps: PropsBlock, newProps: PropsBlock) {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (!response) {
      return;
    }
    this._render();
  }

  componentDidUpdate(_oldProps: PropsBlock, _newProps: PropsBlock): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
    return true;
  }

  setProps = (nextProps: PropsBlock) => {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  };

  get element() {
    return this._element;
  }

  get id() {
    return this._id;
  }

  _addEvents() {
    const events = this.props.events;
    if (!events || typeof events !== 'object') {
      return;
    }

    Object.keys(events).forEach((eventName) => {
      const handler = (events as Record<string, unknown>)[eventName];
      if (typeof handler === 'function') {
        this._element!.addEventListener(eventName, handler as EventListener);
      }
    });
  }

  _removeEvents() {
    const events = this.props.events;
    if (!events || typeof events !== 'object') {
      return;
    }

    Object.keys(events).forEach((eventName) => {
      const handler = (events as Record<string, unknown>)[eventName];
      if (typeof handler === 'function') {
        this._element!.removeEventListener(eventName, handler as EventListener);
      }
    });
  }

  _compile() {
    const propsAndStubs = { ...this.props };

    Object.entries(this.children).forEach(([key, child]) => {
      if (Array.isArray(child)) {
        propsAndStubs[key] = child.map(
          (component: Block) => `<div data-id="${component._id}"></div>`,
        );
      } else {
        propsAndStubs[key] = `<div data-id="${(child as Block)._id}"></div>`;
      }
    });

    const fragment = this._createDocumentElement("template") as HTMLTemplateElement;
    const template = Handlebars.compile(this.render());
    fragment.innerHTML = template(propsAndStubs);

    Object.values(this.children).forEach((child) => {
      if (Array.isArray(child)) {
        child.forEach((component: Block) => {
          const stub = fragment.content.querySelector(
            `[data-id="${component._id}"]`,
          );

          if (stub && component.getContent()) {
            stub.replaceWith(component.getContent()!);
            component.dispatchComponentDidMount();
          }
        });
      } else {
        const blockChild = child as Block;
        const stub = fragment.content.querySelector(`[data-id="${blockChild._id}"]`);

        if (stub && blockChild.getContent()) {
          stub.replaceWith(blockChild.getContent()!);
          blockChild.dispatchComponentDidMount();
        }
      }
    });

    return fragment.content;
  }

  _render() {
    this._removeEvents();
    
    const block = this._compile();

    if (this._element!.children.length === 0) {
      this._element!.appendChild(block);
    } else {
      this._element!.replaceChildren(block);
    }

    this._addEvents();
  }

  render() {
    return "";
  }

  getContent() {
    return this.element;
  }

  _makePropsProxy(props: PropsBlock) {
    const eventBus = this.eventBus();
    const emitBind = eventBus.emit.bind(eventBus);

    return new Proxy(props as Record<string, unknown>, {
      get(target, prop) {
        if (typeof prop === 'symbol') return undefined;
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
      set(target, prop, value) {
        if (typeof prop === 'symbol') return false;
        const oldTarget = { ...target };
        target[prop] = value;

        // Запускаем обновление компоненты
        // Плохой cloneDeep, в следующей итерации нужно заставлять добавлять cloneDeep им самим
        emitBind(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty() {
        throw new Error("Нет доступа");
      },
    });
  }

  _createDocumentElement(tagName: string) {
    // Можно сделать метод, который через фрагменты в цикле создаёт сразу несколько блоков
    return document.createElement(tagName);
  }

  show() {
    this.getContent()!.style.display = "block";
  }

  hide() {
    this.getContent()!.style.display = "none";
  }
}

