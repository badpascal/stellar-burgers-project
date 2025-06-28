import reducer, {
  getFeedsThunk,
  getOrderByNumberThunk,
  ordersSelector,
  isFeedsLoadingSelector,
  orderSelector,
  isOrderLoadingSelector,
  totalSelector,
  totalTodaySelector,
  initialState
} from './feedSlice';
import { TOrder } from '@utils-types';

jest.mock('../../utils/burger-api', () => ({
  getFeedsApi: jest.fn(() => Promise.resolve({
    orders: [],
    total: 0,
    totalToday: 0
  })),
  getOrderByNumberApi: jest.fn(() => Promise.resolve({
    orders: [{} as TOrder]
  }))
}));

describe('Тестирование feedSlice', () => {
  const testOrder: TOrder = {
    _id: '1',
    ingredients: ['60d3b41abdacab0026a733c6'],
    status: 'done',
    name: 'Тестовый заказ',
    createdAt: '2025-06-01T12:00:00.000Z',
    updatedAt: '2025-06-01T12:30:00.000Z',
    number: 1
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Должен возвращать начальное состояние', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('Тестирование состояний загрузки', () => {
    it('Должен устанавливать isFeedsLoading при pending', () => {
      const action = { type: getFeedsThunk.pending.type };
      const state = reducer(initialState, action);
      expect(state.isFeedsLoading).toBe(true);
    });

    it('Должен сбрасывать isFeedsLoading при fulfilled', () => {
      const action = { 
        type: getFeedsThunk.fulfilled.type,
        payload: { orders: [], total: 0, totalToday: 0 }
      };
      const state = reducer({...initialState, isFeedsLoading: true}, action);
      expect(state.isFeedsLoading).toBe(false);
    });

    it('Должен устанавливать isOrderLoading при pending', () => {
      const action = { type: getOrderByNumberThunk.pending.type };
      const state = reducer(initialState, action);
      expect(state.isOrderLoading).toBe(true);
    });
  });

  describe('Тестирование селекторов', () => {
    const testState = {
      feed: {
        ...initialState,
        orders: [testOrder],
        order: testOrder
      }
    };

    it('ordersSelector возвращает список заказов', () => {
      expect(ordersSelector(testState as any)).toEqual([testOrder]);
    });

    it('orderSelector возвращает текущий заказ', () => {
      expect(orderSelector(testState as any)).toEqual(testOrder);
    });
  });

  describe('Базовые тесты thunk', () => {
    it('getFeedsThunk вызывает API', async () => {
      const dispatch = jest.fn();
      await getFeedsThunk()(dispatch, () => {}, undefined);
      expect(dispatch).toHaveBeenCalled();
    });

    it('getOrderByNumberThunk вызывает API', async () => {
      const dispatch = jest.fn();
      await getOrderByNumberThunk(1)(dispatch, () => {}, undefined);
      expect(dispatch).toHaveBeenCalled();
    });
  });
});
