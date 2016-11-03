export function parseJSON (json : string) {
    try {
        let parsedObject = JSON.parse(json);
        return parsedObject;
    } catch (e) {
        return undefined;   
    }
}