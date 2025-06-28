import reducer, {
  getIngredientsThunk,
  ingredientsSelector,
  isIngredientsLoadingSelector,
  initialState
} from './ingredientsSlice';
import { getIngredientsApi } from '@api';
import { TIngredient } from '@utils-types';

// Мокируем API
jest.mock('@api', () => ({
  getIngredientsApi: jest.fn()
}));

const mockedGetIngredientsApi = getIngredientsApi as jest.MockedFunction<
  typeof getIngredientsApi
>;

describe('Тестирование ingredientsSlice', () => {
  const testIngredients: TIngredient[] = [
    {
      _id: '643d69a5c3f7b9001cfa093c',
      name: 'Краторная булка',
      type: 'bun',
      proteins: 80,
      fat: 24,
      carbohydrates: 53,
      calories: 420,
      price: 1255,
      image: 'https://code.s3.yandex.net/react/code/bun-02.png',
      image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
    },
    {
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
      image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png'
    }
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Должен возвращать начальное состояние', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('Тестирование getIngredientsThunk', () => {
    it('Должен корректно обрабатывать pending', () => {
      const action = { type: getIngredientsThunk.pending.type };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        isIngredientsLoading: true,
        error: null
      });
    });

    it('Должен корректно обрабатывать fulfilled', () => {
      const action = {
        type: getIngredientsThunk.fulfilled.type,
        payload: testIngredients
      };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        ingredients: testIngredients,
        isIngredientsLoading: false,
        error: null
      });
    });

    it('Должен корректно обрабатывать rejected', () => {
      const errorMessage = 'Ошибка при загрузке ингредиентов';
      const action = {
        type: getIngredientsThunk.rejected.type,
        error: { message: errorMessage }
      };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        isIngredientsLoading: false,
        error: errorMessage
      });
    });
  });

  describe('Тестирование селекторов', () => {
    const testState = {
      ingredients: {
        ingredients: testIngredients,
        isIngredientsLoading: true,
        error: null
      }
    };

    it('ingredientsSelector должен возвращать список ингредиентов', () => {
      const result = ingredientsSelector(testState as any);
      expect(result).toEqual(testIngredients);
    });

    it('isIngredientsLoadingSelector должен возвращать статус загрузки', () => {
      const result = isIngredientsLoadingSelector(testState as any);
      expect(result).toBe(true);
    });
  });

  describe('Интеграционный тест thunk', () => {
    it('Должен корректно обрабатывать успешный запрос', async () => {
      mockedGetIngredientsApi.mockResolvedValue(testIngredients);

      const dispatch = jest.fn();
      const getState = jest.fn();
      const thunk = getIngredientsThunk();

      await thunk(dispatch, getState, undefined);

      const [pending, fulfilled] = dispatch.mock.calls;

      expect(pending[0].type).toBe(getIngredientsThunk.pending.type);
      expect(fulfilled[0].type).toBe(getIngredientsThunk.fulfilled.type);
      expect(fulfilled[0].payload).toEqual(testIngredients);
    });

    it('Должен корректно обрабатывать ошибку запроса', async () => {
      const errorMessage = 'Network Error';
      mockedGetIngredientsApi.mockRejectedValue(new Error(errorMessage));

      const dispatch = jest.fn();
      const getState = jest.fn();
      const thunk = getIngredientsThunk();

      await thunk(dispatch, getState, undefined);

      const [pending, rejected] = dispatch.mock.calls;

      expect(pending[0].type).toBe(getIngredientsThunk.pending.type);
      expect(rejected[0].type).toBe(getIngredientsThunk.rejected.type);
      expect(rejected[0].error.message).toBe(errorMessage);
    });
  });
});
