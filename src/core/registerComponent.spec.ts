import { expect } from 'chai';
import Handlebars from 'handlebars';
import Block from './block.js';
import registerComponent from './registerComponent.js';

describe('registerComponent', () => {
  beforeEach(() => {
    // Очищаем все зарегистрированные хелперы перед каждым тестом
    const helpers = Handlebars.helpers;
    Object.keys(helpers).forEach((key) => {
      delete helpers[key];
    });
  });

  describe('Регистрация компонента', () => {
    it('должен зарегистрировать компонент как Handlebars helper', () => {
      // Arrange
      class TestComponent extends Block {
        constructor(tagName?: string, props?: Record<string, unknown>) {
          super(tagName || 'div', props);
        }
        render() {
          return '<div>Test</div>';
        }
      }

      // Act
      registerComponent(TestComponent);

      // Assert
      expect(Handlebars.helpers[TestComponent.name]).to.exist;
      expect(typeof Handlebars.helpers[TestComponent.name]).to.equal('function');
    });

    it('должен создать экземпляр компонента при использовании helper', () => {
      // Arrange
      let componentInstance: Block | null = null;
      
      class TestComponent extends Block {
        constructor(tagName?: string, props?: Record<string, unknown>) {
          super(tagName || 'div', props);
          componentInstance = this;
        }
        
        render() {
          return '<div>Test</div>';
        }
      }

      registerComponent(TestComponent);
      const template = Handlebars.compile(`{{#${TestComponent.name}}}{{/${TestComponent.name}}}`);

      // Act
      template({});

      // Assert
      expect(componentInstance).to.not.be.null;
      expect(componentInstance).to.be.instanceOf(Block);
    });

    it('должен добавить компонент в children при использовании helper', () => {
      // Arrange
      class TestComponent extends Block {
        constructor(tagName?: string, props?: Record<string, unknown>) {
          super(tagName || 'div', props);
        }
        render() {
          return '<div>Test</div>';
        }
      }

      registerComponent(TestComponent);
      const template = Handlebars.compile(`{{#${TestComponent.name}}}{{/${TestComponent.name}}}`);
      const context: { children?: Record<string, Block> } = {};

      // Act
      template(context);

      // Assert
      expect(context.children).to.exist;
      expect(Object.keys(context.children!)).to.have.length.greaterThan(0);
    });

    it('должен создать ref при передаче параметра ref', () => {
      // Arrange
      class TestComponent extends Block {
        constructor(tagName?: string, props?: Record<string, unknown>) {
          super(tagName || 'div', props);
        }
        render() {
          return '<div>Test</div>';
        }
      }

      registerComponent(TestComponent);
      const template = Handlebars.compile(`{{#${TestComponent.name} ref="testRef"}}{{/${TestComponent.name}}}`);
      const context: { refs?: Record<string, HTMLElement> } = {};

      // Act
      template(context);

      // Assert
      expect(context.refs).to.exist;
      expect(context.refs!.testRef).to.exist;
    });

    it('должен передать props в компонент через hash', () => {
      // Arrange
      let receivedProps: Record<string, unknown> | null = null;
      
      class TestComponent extends Block {
        constructor(tagName?: string, props?: Record<string, unknown>) {
          super(tagName || 'div', props);
          receivedProps = props || {};
        }
        
        render() {
          return '<div>Test</div>';
        }
      }

      registerComponent(TestComponent);
      const template = Handlebars.compile(`{{#${TestComponent.name} className="test-class" dataId="123"}}{{/${TestComponent.name}}}`);

      // Act
      template({});

      // Assert
      expect(receivedProps).to.not.be.null;
      expect(receivedProps!.className).to.equal('test-class');
      expect(receivedProps!.dataId).to.equal('123');
    });

    it('должен вернуть HTML с data-id атрибутом', () => {
      // Arrange
      class TestComponent extends Block {
        constructor(tagName?: string, props?: Record<string, unknown>) {
          super(tagName || 'div', props);
        }
        render() {
          return '<div>Test</div>';
        }
      }

      registerComponent(TestComponent);
      const template = Handlebars.compile(`{{#${TestComponent.name}}}{{/${TestComponent.name}}}`);

      // Act
      const result = template({});

      // Assert
      expect(result).to.include('data-id');
      expect(result).to.match(/<div data-id="[^"]+">/);
    });

    it('должен обработать содержимое блока через fn', () => {
      // Arrange
      class TestComponent extends Block {
        constructor(tagName?: string, props?: Record<string, unknown>) {
          super(tagName || 'div', props);
        }
        render() {
          return '<div>Test</div>';
        }
      }

      registerComponent(TestComponent);
      const template = Handlebars.compile(`{{#${TestComponent.name}}}Inner content{{/${TestComponent.name}}}`);

      // Act
      const result = template({});

      // Assert
      expect(result).to.include('Inner content');
    });

  });
});




