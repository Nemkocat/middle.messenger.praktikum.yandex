import Block from "./block";
import renderDOM from "./renderDom";

interface RouteProps {
  rootQuery: string;
}

type BlockConstructor = new (props?: any) => Block; // eslint-disable-line @typescript-eslint/no-explicit-any
type BlockFactory = () => Block;

function isEqual(lhs: string, rhs: string): boolean {
  return lhs === rhs;
}

export class Route {
  private _pathname: string;
  private _blockClass: BlockConstructor | null = null;
  private _blockFactory: BlockFactory | null = null;
  private _block: Block | null = null;
  // _props хранится для возможного будущего использования (например, для передачи rootQuery в блоки)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _props: RouteProps;

  constructor(
    pathname: string,
    view: BlockConstructor | BlockFactory,
    props: RouteProps
  ) {
    this._pathname = pathname;
    this._props = props;
    
    // Определяем, это класс или фабрика
    // Класс можно вызвать с new, фабрика - нет
    // Проверяем наличие prototype.constructor === view (для классов это true)
    const isClass = typeof view === "function" && 
                    view.prototype && 
                    view.prototype.constructor === view &&
                    view.toString().startsWith("class");
    
    if (isClass) {
      this._blockClass = view as BlockConstructor;
    } else {
      this._blockFactory = view as BlockFactory;
    }
  }

  leave() {
    if (this._block) {
      this._block.hide();
    }
  }

  match(pathname: string): boolean {
    return isEqual(pathname, this._pathname);
  }

  render() {
    // Всегда создаем новый блок для фабрик
    if (this._blockFactory) {
      this._block = this._blockFactory();
    } else if (this._blockClass) {
      // Для классов также всегда создаем новый экземпляр
      // Это гарантирует, что данные будут актуальными при каждом переходе
        this._block = new this._blockClass();
      } else {
        throw new Error("Route: neither block class nor factory is defined");
    }

    // Всегда монтируем блок в DOM (renderDOM очищает контейнер перед добавлением)
    // Это гарантирует, что блок будет правильно отображен при навигации назад/вперед
    if (this._block) {
    renderDOM(this._block);
    }
  }

  getBlock(): Block | null {
    return this._block;
  }
}

