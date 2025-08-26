import Handlebars from 'handlebars';
import * as Pages from './pages';

// Register partials
import Button from './components/Button.js';
import Input from './components/Input.js';

Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('Input', Input);

export default class App {
    constructor() {
        this.state = {
        currentPage: 'LoginPage',
        };
        
        this.appElement = document.getElementById('app');
    }

    render() {
        let template;
        let data = {};
        switch (this.state.currentPage) {
            case 'login':
            template = Handlebars.compile(Pages.LoginPage);
            break;

            case 'register':
            template = Handlebars.compile(Pages.RegisterPage);
            break;

            default:
            template = Handlebars.compile(Pages.LoginPage);
        }
        this.appElement.innerHTML = template(data);
        this.attachEventListeners();
    }
}


//   render() {
//     let template;
//     if (this.state.currentPage === 'LoginPage') {
//       template = Handlebars.compile(Pages.CreatePage);
//       this.appElement.innerHTML = template({
//         questions: this.state.questions, 
//         createButtonEnabled: this.state.questions.length == 0
//       });
//     } else {
//       template = Handlebars.compile(Pages.AnswersPage);
//       this.appElement.innerHTML = template();
//     }
//     this.attachEventListeners();
//   }



// //     const footerLinks = document.querySelectorAll('.footer-link');
// //     footerLinks.forEach(link => {
// //       link.addEventListener('click', (e) => {
// //         e.preventDefault();
// //         this.changePage(e.target.dataset.page);
// //       });
// //     });
// }

// //   changePage(page) {
// //     this.state.currentPage = page;
// //     this.render();
// // }

