export class BaseAPI {
  // На случай, если забудете переопределить метод и используете его, — выстрелит ошибка
  create(): never {
    throw new Error('Not implemented');
  }

  request(): never {
    throw new Error('Not implemented');
  }

  update(): never {
    throw new Error('Not implemented');
  }

  delete(): never {
    throw new Error('Not implemented');
  }
}

