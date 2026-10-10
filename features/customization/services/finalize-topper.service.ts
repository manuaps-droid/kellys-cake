import {
  finalizeTopperRepository,
  type FinalizeTopperOrderInput,
} from "../repositories/finalize-topper.repository";

export async function finalizeTopperService(
  input: FinalizeTopperOrderInput
) {
  return finalizeTopperRepository(input);
}
