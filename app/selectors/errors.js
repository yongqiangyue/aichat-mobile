export function getDisplayableErrors(state) {
    return state.errors.filter((error) => error.displayable);
}
