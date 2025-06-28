import reducer, {
  addIngredient,
  upIngredient,
  downIngredient,
  removeIngredient,
  clearBurgerConstructor,
  burgerConstructorSelector,
  initialState
} from './burgerConstructorSlice';
import { TConstructorIngredient } from '@utils-types';

describe('Проверка работы burgerConstructorSlice', () => {
  const testBun: TConstructorIngredient = {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Флюоресцентная булка',
    type: 'bun',
    proteins: 44,
    fat: 26,
    carbohydrates: 85,
    calories: 643,
    price: 988,
    image: 'https://code.s3.yandex.net/react/code/bun-01.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-01-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-01-mobile.png',
    id: 'bun-1'
  };

  const anotherTestBun: TConstructorIngredient = {
    _id: '643d69a5c3f7b9001cfa093d',
    name: 'Краторная булка',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    id: 'bun-2'
  };

  const testMain: TConstructorIngredient = {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
    id: 'main-1'
  };

  const testSauce: TConstructorIngredient = {
    _id: '643d69a5c3f7b9001cfa0942',
    name: 'Соус фирменный Space Sauce',
    type: 'sauce',
    proteins: 50,
    fat: 22,
    carbohydrates: 11,
    calories: 14,
    price: 80,
    image: 'https://code.s3.yandex.net/react/code/sauce-04.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-04-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-04-mobile.png',
    id: 'sauce-1'
  };

  it('Должен вернуть initialState', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('Проверка addIngredient', () => {
    it('Добавляет булку с генерацией id', () => {
      const { id, ...bunWithoutId } = testBun;
      const action = addIngredient(bunWithoutId);
      const state = reducer(initialState, action);

      expect(state.burgerConstructor.bun).not.toBeNull();
      expect(state.burgerConstructor.bun?.name).toBe('Флюоресцентная булка');
      expect(state.burgerConstructor.bun?.id).toBeDefined();
      expect(state.burgerConstructor.ingredients.length).toBe(0);
    });

    it('Добавляет начинку с генерацией уникального id', () => {
      const { id, ...mainWithoutId } = testMain;
      const { id: sauceId, ...sauceWithoutId } = testSauce;
      
      const action1 = addIngredient(mainWithoutId);
      const action2 = addIngredient(sauceWithoutId);
      
      const state1 = reducer(initialState, action1);
      const state2 = reducer(state1, action2);

      expect(state2.burgerConstructor.ingredients.length).toBe(2);
      expect(state2.burgerConstructor.ingredients[0].id).not.toBe(
        state2.burgerConstructor.ingredients[1].id
      );
    });

    it('Заменяет существующую булку при добавлении новой', () => {
      const stateWithFirstBun = {
        ...initialState,
        burgerConstructor: {
          bun: testBun,
          ingredients: []
        }
      };

      const { id, ...newBunWithoutId } = anotherTestBun;
      const action = addIngredient(newBunWithoutId);
      const newState = reducer(stateWithFirstBun, action);

      expect(newState.burgerConstructor.bun).not.toBeNull();
      expect(newState.burgerConstructor.bun?._id).toBe('643d69a5c3f7b9001cfa093d');
      expect(newState.burgerConstructor.bun?.name).toBe('Краторная булка');
      expect(newState.burgerConstructor.bun?.id).toBeDefined();
      expect(newState.burgerConstructor.bun?.id).not.toBe('bun-1');
    });
  });

  describe('Проверка removeIngredient', () => {
    it('Удаляет конкретную начинку по id', () => {
      const stateWithIngredients = {
        ...initialState,
        burgerConstructor: {
          bun: testBun,
          ingredients: [testMain, testSauce]
        }
      };

      const action = removeIngredient(testMain);
      const finalState = reducer(stateWithIngredients, action);

      expect(finalState.burgerConstructor.ingredients.length).toBe(1);
      expect(finalState.burgerConstructor.ingredients[0]._id).toBe('643d69a5c3f7b9001cfa0942');
    });
  });

  describe('Проверка перемещения ингредиентов', () => {
    const stateWithIngredients = {
      ...initialState,
      burgerConstructor: {
        bun: testBun,
        ingredients: [testMain, testSauce]
      }
    };

    it('Перемещает ингредиент вверх (upIngredient)', () => {
      const state = reducer(stateWithIngredients, upIngredient(1));
      
      expect(state.burgerConstructor.ingredients[0]._id).toBe('643d69a5c3f7b9001cfa0942');
      expect(state.burgerConstructor.ingredients[1]._id).toBe('643d69a5c3f7b9001cfa0941');
    });

    it('Перемещает ингредиент вниз (downIngredient)', () => {
      const state = reducer(stateWithIngredients, downIngredient(0));
      
      expect(state.burgerConstructor.ingredients[0]._id).toBe('643d69a5c3f7b9001cfa0942');
      expect(state.burgerConstructor.ingredients[1]._id).toBe('643d69a5c3f7b9001cfa0941');
    });
  });

  describe('Проверка clearBurgerConstructor', () => {
    it('Очищает весь конструктор', () => {
      const stateWithItems = {
        ...initialState,
        burgerConstructor: {
          bun: testBun,
          ingredients: [testMain, testSauce]
        }
      };

      const state = reducer(stateWithItems, clearBurgerConstructor());
      
      expect(state.burgerConstructor.bun).toBeNull();
      expect(state.burgerConstructor.ingredients.length).toBe(0);
    });
  });

  describe('Проверка селектора', () => {
    it('burgerConstructorSelector возвращает корректные данные', () => {
      const testState = {
        burgerConstructor: {
          burgerConstructor: {
            bun: testBun,
            ingredients: [testMain]
          },
          error: null
        }
      };

      expect(burgerConstructorSelector(testState as any)).toEqual({
        bun: testBun,
        ingredients: [testMain]
      });
    });
  });
});
