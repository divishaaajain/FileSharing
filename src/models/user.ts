export default interface User {
    id: number;
    username: string;
    created_files: number[];
    accessible_files: number[];
}