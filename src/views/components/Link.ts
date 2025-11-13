import Block from "../../core/block";
import { Router } from "../../core/router";

interface LinkProps {
  href?: string;
  class?: string;
  page?: string;
  path?: string; // Новый параметр для пути роутера
  text: string;
  img?: string;
  imgClass?: string;
  imgAlt?: string;
  onClick?: (e: Event) => void;
}

export default class Link extends Block {
  constructor(props: LinkProps) {
    // Вычисляем путь до вызова super()
    const path = props.path || Link.getPathFromPage(props.page);
    
    super("a", {
      ...props,
      // img, imgClass, imgAlt должны быть в props, а не в attrs, чтобы использоваться в шаблоне
      img: props.img || "",
      imgClass: props.imgClass || "",
      imgAlt: props.imgAlt || "img",
      attrs: {
        href: props.href || path || "#",
        class: props.class,
        "data-page": props.page || "",
      },
      events: {
        click: (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Получаем роутер из window или через getInstance
          const router = window.router || Router.getInstance();
          
          // Если есть onClick, вызываем его
          if (props.onClick) {
            props.onClick(e);
          }
          
          // Если есть path или page, переходим через роутер
          if (router && (path || props.page)) {
            const targetPath = path || Link.getPathFromPage(props.page);
            if (targetPath) {
              router.go(targetPath);
            }
          }
        },
      },
    });
  }

  // Преобразует page в путь роутера
  private static getPathFromPage(page?: string): string {
    const pageToPathMap: Record<string, string> = {
      login: "/",
      register: "/sign-up",
      main: "/messenger",
      profile: "/settings",
      settings: "/settings",
      editProfile: "/edit-profile",
      editPassword: "/profile/password",
      error404: "/404",
      error500: "/500",
    };
    
    return page ? (pageToPathMap[page] || `/${page}`) : "";
  }

  render(): string {
    return `
      {{text}}
      {{#if img}}<img src="{{img}}" class="{{imgClass}}" alt="{{imgAlt}}">{{/if}}
    `;
  }
}

