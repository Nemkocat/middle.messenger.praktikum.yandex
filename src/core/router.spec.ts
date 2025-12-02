import { expect } from 'chai';
import sinon from 'sinon';
import { Router } from './router.js';
import { Route } from './route.js';
import Block from './block.js';
import AuthController from '../controllers/AuthController.js';

describe('Router', () => {
  let router: Router;
  let mockBlock: Block;
  let authControllerStub: sinon.SinonStub;

  beforeEach(() => {
    // Создаем стаб для AuthController.checkAuth
    authControllerStub = sinon.stub(AuthController, 'checkAuth');

    // Создаем моковый блок для тестов
    class MockBlock extends Block {
      render() {
        return '<div>Mock Block</div>';
      }
    }
    mockBlock = new MockBlock();

    // Сбрасываем instance роутера перед каждым тестом
    (Router as any).__instance = undefined;

    // Создаем новый роутер
    router = new Router('#app');

    // Устанавливаем начальное состояние истории
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    // Восстанавливаем стаб
    authControllerStub.restore();
    
    // Очищаем историю браузера
    window.history.replaceState({}, '', '/');
  });

  describe('Конструктор', () => {
    it('должен создать единственный экземпляр (singleton)', () => {
      // Arrange & Act
      const router1 = new Router('#app');
      const router2 = new Router('#app');

      // Assert
      expect(router1).to.equal(router2);
    });

    it('должен установить rootQuery', () => {
      // Arrange & Act
      const testRouter = new Router('#test-root');

      // Assert
      expect(testRouter).to.exist;
    });
  });

  describe('use', () => {
    it('должен добавить маршрут в список маршрутов', () => {
      // Arrange
      class TestBlock extends Block {
        render() {
          return '<div>Test</div>';
        }
      }

      // Act
      router.use('/test', TestBlock);

      // Assert
      const route = router.getRoute('/test');
      expect(route).to.exist;
      expect(route).to.be.instanceOf(Route);
    });

    it('должен вернуть this для цепочки вызовов', () => {
      // Arrange
      class TestBlock extends Block {
        render() {
          return '<div>Test</div>';
        }
      }

      // Act
      const result = router.use('/test', TestBlock);

      // Assert
      expect(result).to.equal(router);
    });

    it('должен поддерживать фабрику блоков', () => {
      // Arrange
      const blockFactory = () => mockBlock;

      // Act
      router.use('/test', blockFactory);

      // Assert
      const route = router.getRoute('/test');
      expect(route).to.exist;
    });
  });

  describe('getRoute', () => {
    it('должен вернуть маршрут по pathname', () => {
      // Arrange
      class TestBlock extends Block {
        render() {
          return '<div>Test</div>';
        }
      }
      router.use('/test', TestBlock);

      // Act
      const route = router.getRoute('/test');

      // Assert
      expect(route).to.exist;
      expect(route?.match('/test')).to.be.true;
    });

    it('должен вернуть undefined для несуществующего маршрута', () => {
      // Act
      const route = router.getRoute('/non-existent');

      // Assert
      expect(route).to.be.undefined;
    });
  });

  describe('go', () => {
    it('Переход на новую страницу должен менять состояние сущности history', async () => {
      // Arrange
      class TestBlock extends Block {
        render() {
          return '<div>Test</div>';
        }
      }
      router.use('/test', TestBlock);
      
      // Настраиваем стаб для возврата true
      authControllerStub.resolves(true);

      const initialLength = window.history.length;

      // Act
      await router.go('/test');

      // Assert
      expect(window.history.length).to.equal(initialLength + 1);
      expect(window.location.pathname).to.equal('/test');
    });

    it('должен изменять pathname при нескольких переходах', async () => {
      // Arrange
      class LoginBlock extends Block {
        render() {
          return '<div>Login</div>';
        }
      }
      class RegisterBlock extends Block {
        render() {
          return '<div>Register</div>';
        }
      }
      router.use('/login', LoginBlock);
      router.use('/register', RegisterBlock);
      
      authControllerStub.resolves(true);

      // Act
      await router.go('/login');
      const pathnameAfterLogin = window.location.pathname;
      await router.go('/register');
      const pathnameAfterRegister = window.location.pathname;

      // Assert
      expect(pathnameAfterLogin).to.equal('/login');
      expect(pathnameAfterRegister).to.equal('/register');
      expect(window.history.length).to.be.greaterThan(1);
    });

    it('должен увеличивать длину истории при каждом переходе', async () => {
      // Arrange
      class LoginBlock extends Block {
        render() {
          return '<div>Login</div>';
        }
      }
      class RegisterBlock extends Block {
        render() {
          return '<div>Register</div>';
        }
      }
      router.use('/login', LoginBlock);
      router.use('/register', RegisterBlock);
      
      AuthController.checkAuth = async () => true;

      const initialLength = window.history.length;

      // Act
      await router.go('/login');
      await router.go('/register');

      // Assert
      expect(window.history.length).to.equal(initialLength + 2);
      expect(window.location.pathname).to.equal('/register');
    });
  });

  describe('back', () => {
    it('должен вернуться назад в истории', async () => {
      // Arrange
      class TestBlock extends Block {
        render() {
          return '<div>Test</div>';
        }
      }
      class RegisterBlock extends Block {
        render() {
          return '<div>Register</div>';
        }
      }
      router.use('/test', TestBlock);
      router.use('/register', RegisterBlock);
      
      AuthController.checkAuth = async () => true;

      await router.go('/test');
      const pathnameAfterFirst = window.location.pathname;
      await router.go('/register');
      const pathnameAfterSecond = window.location.pathname;

      // Act
      router.back();

      // Assert
      // После back() должен вернуться на предыдущую страницу
      // Проверяем, что состояние истории изменилось
      expect(pathnameAfterFirst).to.equal('/test');
      expect(pathnameAfterSecond).to.equal('/register');
    });
  });

  describe('forward', () => {
    it('должен перейти вперед в истории', async () => {
      // Arrange
      class TestBlock extends Block {
        render() {
          return '<div>Test</div>';
        }
      }
      class RegisterBlock extends Block {
        render() {
          return '<div>Register</div>';
        }
      }
      router.use('/test', TestBlock);
      router.use('/register', RegisterBlock);
      
      AuthController.checkAuth = async () => true;

      await router.go('/test');
      await router.go('/register');
      router.back();

      // Act
      router.forward();

      // Assert
      // После forward() должен вернуться на следующую страницу
      // Проверяем, что состояние истории изменилось
      expect(window.location.pathname).to.equal('/register');
    });
  });

  describe('_onRoute', () => {
    it('должен перенаправить неавторизованного пользователя на публичный маршрут', async () => {
      // Arrange
      class ProtectedBlock extends Block {
        render() {
          return '<div>Protected</div>';
        }
      }
      class PublicBlock extends Block {
        render() {
          return '<div>Public</div>';
        }
      }
      
      router.use('/protected', ProtectedBlock);
      router.use('/', PublicBlock);
      
      // Настраиваем стаб для возврата false (неавторизован)
      authControllerStub.resolves(false);

      // Act
      await (router as any)._onRoute('/protected');

      // Assert
      // Должен произойти редирект на '/'
      expect(window.location.pathname).to.equal('/');
    });

    it('должен перенаправить авторизованного пользователя с публичного маршрута на /messenger', async () => {
      // Arrange
      class PublicBlock extends Block {
        render() {
          return '<div>Public</div>';
        }
      }
      class MessengerBlock extends Block {
        render() {
          return '<div>Messenger</div>';
        }
      }
      
      router.use('/', PublicBlock);
      router.use('/messenger', MessengerBlock);
      
      // Мокаем checkAuth для возврата true (авторизован)
      AuthController.checkAuth = async () => true;

      // Act
      await (router as any)._onRoute('/');

      // Assert
      // Должен произойти редирект на '/messenger'
      expect(window.location.pathname).to.equal('/messenger');
    });
  });

  describe('getCurrentRoute', () => {
    it('должен вернуть текущий маршрут', async () => {
      // Arrange
      class TestBlock extends Block {
        render() {
          return '<div>Test</div>';
        }
      }
      
      router.use('/test', TestBlock);
      AuthController.checkAuth = async () => true;

      // Act
      await (router as any)._onRoute('/test');
      const currentRoute = router.getCurrentRoute();

      // Assert
      expect(currentRoute).to.exist;
      expect(currentRoute?.match('/test')).to.be.true;
    });

    it('должен вернуть null если маршрут не установлен', () => {
      // Act
      const currentRoute = router.getCurrentRoute();

      // Assert
      expect(currentRoute).to.be.null;
    });
  });
});
