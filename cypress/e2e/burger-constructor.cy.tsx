import { SELECTORS } from '../support/constants';

describe('I. Добавление ингредиентов в конструктор', () => {
  beforeEach(() => {
    // 1. Устанавливаем токены способами, которые использует приложение
    cy.setCookie('accessToken', 'test-access-token');
    window.localStorage.setItem('refreshToken', 'test-refresh-token');
    
    // 2. Загружаем ингредиенты
    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredientsFixture' }).as('getIngredients');
    // 3. baseUrl прописан в конфиге cypress
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  afterEach(() => {
    cy.clearCookie('accessToken');
    window.localStorage.removeItem('refreshToken');
  });

  it('should add ingredients to constructor', () => {
    cy.get(SELECTORS.NO_BUNS_TOP).should('exist');
    cy.get(SELECTORS.NO_INGREDIENTS).should('exist');

    // Добавляем булку
    cy.get('[data-ingredient="bun"]').first().find('button').click();
    cy.get(SELECTORS.NO_BUNS_TOP).should('not.exist');
    cy.get('[data-cy="no-buns-bottom"]').should('not.exist');

    // Добавляем начинку
    cy.get('[data-ingredient="main"]').first().find('button').click();
    cy.get(SELECTORS.NO_INGREDIENTS).should('not.exist');
  });
});

describe('II. Тестируем работу модальных окон', () => {
  beforeEach(() => {
    cy.setCookie('accessToken', 'test-access-token');
    window.localStorage.setItem('refreshToken', 'test-refresh-token');
    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredientsFixture' }).as('getIngredients');
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  afterEach(() => {
    cy.clearCookie('accessToken');
    window.localStorage.removeItem('refreshToken');
  });

  it('should open modal with correct ingredient data from fixtures', () => {
    // Загружаем фикстуру с ингредиентами
    cy.fixture('ingredientsFixture').then((fixture) => {
      const testIngredient = fixture.data.find((ing: any) => ing.type === 'main');
      
      // Открываем модалку
      cy.get('[data-ingredient="main"]').first().click();
      
      // Проверяем что модальное окно открылось
      cy.get(SELECTORS.MODAL).should('exist');

      // Проверяем что имя ингредиента в модальном окне именно того, по которому был клик
      cy.get(SELECTORS.INGREDIENT_DETAILS_NAME)
        .should('have.text', testIngredient.name);

      // Закрываем модальное окно крестиком
      cy.get(SELECTORS.MODAL_CLOSE).click();
      cy.get(SELECTORS.MODAL).should('not.exist');

      // Открываем снова
      cy.get('[data-ingredient="main"]').first().click();

      // Закрываем кликом на оверлей
      cy.get(SELECTORS.MODAL_OVERLAY).click({ force: true });
      cy.get(SELECTORS.MODAL).should('not.exist');
    });
  });
});

describe('III. Тестируем создание заказа', () => {
  beforeEach(() => {
    cy.setCookie('accessToken', 'test-access-token');
    window.localStorage.setItem('refreshToken', 'test-refresh-token');
    cy.intercept('GET', 'api/auth/user', { fixture: 'userFixture' }).as('getUser');
    cy.intercept('POST', 'api/orders', { fixture: 'orderFixture' }).as('createOrder');
    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredientsFixture' }).as('getIngredients');
    cy.visit('/');
    cy.wait(['@getIngredients', '@getUser']);
  });

  afterEach(() => {
    cy.clearCookie('accessToken');
    window.localStorage.removeItem('refreshToken');
  });

  it('should create order and show modal', () => {
    // Добавляем ингредиенты
    cy.get('[data-ingredient="bun"]').first().find('button').click();
    cy.get('[data-ingredient="main"]').first().find('button').click();

    // Оформляем заказ
    cy.get('[data-order-button]').click();
    cy.wait('@createOrder');

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
});
