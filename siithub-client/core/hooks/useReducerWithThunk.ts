import { Reducer, ReducerState, useReducer } from 'react'

export function useReducerWithThunk<Tred extends Reducer<any, any>, Tinit extends ReducerState<Tred>>(reducer: Tred, initialState: Tinit) {
    const [state, dispatch] = useReducer<Tred>(reducer, initialState);
    let customDispatch = (action: any) => {
      if (typeof action === 'function') {
          action(customDispatch);
      } else {
          dispatch(action); 
      }
    };

  return [state, customDispatch];
}
