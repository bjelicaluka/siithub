import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


const useZodValidatedFrom = <TOut extends FieldValues = FieldValues>(scheme: any) => {
  return useForm<TOut>({
    resolver: zodResolver(scheme)
  })
}

export {
  useZodValidatedFrom
}