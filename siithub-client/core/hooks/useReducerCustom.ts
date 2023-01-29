import { Reducer, ReducerState, useMemo, useReducer, useState } from "react";

export function useReducerWithThunk<Tred extends Reducer<any, any>, Tinit extends ReducerState<Tred>>(
  reducer: Tred,
  initialState: Tinit
) {
  const [state, dispatch] = useReducer<Tred>(reducer, initialState);
  let customDispatch = (action: any) => {
    if (typeof action === "function") {
      action(customDispatch);
    } else {
      dispatch(action);
    }
  };

  return [state, customDispatch];
}

let changeableState: any = undefined;

export function useReducerWithThunkAndImmer<Tred extends Reducer<any, any>, Tinit extends ReducerState<Tred>>(
  reducer: Tred,
  initialState: Tinit
) {
  const [state, setState] = useState({ ...initialState });
  const produceableFunction = useMemo(() => findActionHandler(reducer), [reducer]);

  if (!changeableState) {
    changeableState = { ...initialState };
  }

  let customDispatch = (action: any) => {
    if (typeof action === "function") {
      action(customDispatch);
    } else {
      const newState = produceableFunction(changeableState, action);
      changeableState = { ...newState };
      setState({ ...newState });
    }
  };

  return [state, customDispatch];
}

export function findActionHandler(handlers: any) {
  return (state: any, action: any) => {
    var keys = Object.keys(handlers).filter((key) => key.includes(action.type));
    var property = keys.length ? keys[0] : "";

    if (handlers.hasOwnProperty(property)) {
      return handlers[property](state, action);
    } else {
      return state;
    }
  };
}
