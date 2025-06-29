import { SELECTORS } from '../support/constants';
describe('Burger Constructor Tests', () => {
  
  beforeEach(() => {
    // 1. Устанавливаем токены способами, которые использует приложение
    cy.setCookie('accessToken', 'test-access-token'); // Для куки
    window.localStorage.setItem('refreshToken', 'test-refresh-token'); // Для localStorage
  
    // 2. Мокаем API
    cy.intercept('GET', 'api/auth/user', { fixture: 'userFixture'}).as('getUser');

    // 3. Мокаем создание заказа
    cy.intercept('POST', 'api/orders', { fixture: 'orderFixture'}).as('createOrder');

    // 4. Загружаем ингредиенты
    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredientsFixture' }).as('getIngredients');
  
    // 5. baseUrl прописан в конфиге cypress
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  afterEach(() => {
    cy.clearCookie('accessToken');
    window.localStorage.removeItem('refreshToken');
  });

  // I. Тестируем добавление ингредиентов в конструктор
  it('should add ingredients to constructor', () => {
    cy.get(SELECTORS.NO_BUNS_TOP).should('exist');
    cy.get(SELECTORS.NO_INGREDIENTS).should('exist');

    cy.get('[data-ingredient="bun"]').first().find('button').click();
    cy.get(SELECTORS.NO_BUNS_TOP).should('not.exist');
    cy.get('[data-cy="no-buns-bottom"]').should('not.exist');

    cy.get('[data-ingredient="main"]').first().find('button').click();
    cy.get(SELECTORS.NO_INGREDIENTS).should('not.exist');
  });

  // II. Тестируем работу модальных окон
  it('should open modal with correct ingredient data from fixtures', () => {
    // Загружаем фикстуру с ингредиентами
    cy.fixture('ingredientsFixture').then((fixture) => {
    // Находим первый основной ингредиент в фикстуре
    const testIngredient = fixture.data.find((ing: any) => ing.type === 'main');
    
    // Кликаем на первый основной ингредиент в интерфейсе
    cy.get('[data-ingredient="main"]').first().click();
    
    // Проверяем что модальное окно открылось
    cy.get(SELECTORS.MODAL).should('exist');
    
    // Проверяем что имя ингредиента в модальном окне именно того, по которому был клик
    cy.get(SELECTORS.INGREDIENT_DETAILS_NAME).should('have.text', testIngredient.name);
    
    // Закрываем модальное окно
    cy.get(SELECTORS.MODAL_CLOSE).click();
    cy.get(SELECTORS.MODAL).should('not.exist');

    // Открываем снова
    cy.get('[data-ingredient="main"]').first().click();
    
    // Закрываем кликом на оверлей
    cy.get(SELECTORS.MODAL_OVERLAY).click({ force: true });
    cy.get(SELECTORS.MODAL).should('not.exist');
  });
  });

  // III. Тестируем создание заказа
  it('should create order and show modal', () => {
    // Ждем загрузки пользователя
    cy.wait('@getUser').then((interception) => {
        expect(interception.response?.body.success).to.be.true;
    });

    // Добавляем ингредиенты
    cy.get('[data-ingredient="bun"]').first().find('button').click();
    cy.get('[data-ingredient="main"]').first().find('button').click();

    // Кликаем кнопку заказа
    cy.get('[data-order-button]').click();

    // Ждем завершения оформления и появления номера заказа
    cy.get('[data-cy="order-number"]', { timeout: 10000 })
      .should('exist')
      .and('contain', '82960');

    // Проверяем что модальное окно в правильном состоянии
    cy.get('[data-cy="order-done-image"]').should('be.visible');
    cy.get('[data-cy="order-status-message"]').should('contain', 'Ваш заказ начали готовить');
    cy.get('[data-cy="order-wait-message"]').should('contain', 'Дождитесь готовности');

    // Закрываем модальное окно после появления номера
    cy.get(SELECTORS.MODAL_CLOSE).click();
    cy.get(SELECTORS.MODAL).should('not.exist');

    // Проверяем что конструктор очистился
    cy.get(SELECTORS.NO_BUNS_TOP).should('exist');
    cy.get(SELECTORS.NO_INGREDIENTS).should('exist');
  });
})
