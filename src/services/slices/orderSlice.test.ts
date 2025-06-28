import reducer, {
  orderBurgerThunk,
  clearOrder,
  isOrderLoadingSelector,
  orderSelector,
  initialState
} from './orderSlice';
import { orderBurgerApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';

// Мокируем API
jest.mock('../../utils/burger-api', () => ({
  orderBurgerApi: jest.fn()
}));

const mockedOrderBurgerApi = orderBurgerApi as jest.MockedFunction<typeof orderBurgerApi>;

describe('Тестирование orderSlice', () => {
  const testOrder: TOrder = {
    _id: '1',
    ingredients: ['60d3b41abdacab0026a733c6', '60d3b41abdacab0026a733c7'],
    status: 'done',
    name: 'Space флюоресцентный бургер',
    createdAt: '2025-06-01T12:00:00.000Z',
    updatedAt: '2025-06-01T12:30:00.000Z',
    number: 12345
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Должен возвращать начальное состояние', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('Тестирование orderBurgerThunk', () => {
    it('Должен корректно обрабатывать pending', () => {
      const action = { type: orderBurgerThunk.pending.type };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        isOrderLoading: true,
        error: null
      });
    });

    it('Должен корректно обрабатывать fulfilled', () => {
      const action = {
        type: orderBurgerThunk.fulfilled.type,
        payload: { order: testOrder }
      };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        order: testOrder,
        isOrderLoading: false,
        error: null
      });
    });

    it('Должен корректно обрабатывать rejected', () => {
      const errorMessage = 'Ошибка при создании заказа';
      const action = {
        type: orderBurgerThunk.rejected.type,
        error: { message: errorMessage }
      };
      const state = reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        isOrderLoading: false,
        error: errorMessage
      });
    });
  });

  describe('Тестирование clearOrder', () => {
    it('Должен очищать заказ и сбрасывать флаги', () => {
      const stateWithOrder = {
        ...initialState,
        order: testOrder,
        isOrderLoading: true
      };
      const state = reducer(stateWithOrder, clearOrder());

      expect(state).toEqual({
        ...initialState,
        order: null,
        isOrderLoading: false,
        error: null
      });
    });
  });

  describe('Тестирование селекторов', () => {
    const testState = {
      order: {
        order: testOrder,
        isOrderLoading: true,
        error: null
      }
    };

    it('isOrderLoadingSelector должен возвращать статус загрузки', () => {
      expect(isOrderLoadingSelector(testState as any)).toBe(true);
    });

    it('orderSelector должен возвращать текущий заказ', () => {
      expect(orderSelector(testState as any)).toEqual(testOrder);
    });
  });
});
