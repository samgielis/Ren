import {FBPostResponse} from "./IFBResponse";
import {FB_PAGE_ID} from "./FacebookProxy";

export const manualFacebookFeed: FBPostResponse[] = [
    manualFacebookPostImport(
        'Dikke proficiat voor onze rode duivels van het Ren Sport team.',
        '2018/07/07',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36770646_737851716338461_2116977251210756096_n.jpg?_nc_cat=0&oh=7af8445368da3aaf8bf3cee8a34ab006&oe=5BDC71BF'
    ),
    manualFacebookPostImport(
        'Heel warm weer, veel drinken!!!\n' +
        'Wat drinken voor en na een training/ wedstrijd?\n' +
        'NIEUW bij Ren Sport is OVERSTIMS.\n' +
        'Een ideaal voordeelpakket voor de marathonlopers, met extra een band voor u nummer en je energiegels voor onderweg.',
        '2018/07/04',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36682613_734800719976894_497555906653847552_n.jpg?_nc_cat=0&oh=e87ecac5d3e3fb95712ec25a9ac4fbb8&oe=5BD363AE'
    ),
    manualFacebookPostImport(
        'Messalina Pieroni, mooi artikel en mooi foto’s.',
        '2018/07/03',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36531094_733435116780121_1939821811734675456_n.jpg?_nc_cat=0&oh=6c7b5314822dc943f8b86f67cf4877e7&oe=5BDE4FA3'
    ),
    manualFacebookPostImport(
        'Koopjes!!!!!! \n' +
        'Wil je goed sportgerief, bij Ren Sport moet je zijn.',
        '2018/07/01',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36520563_731171860339780_8226576463223062528_o.jpg?_nc_cat=0&oh=22fdde6b44c6e953588ca729f300d1da&oe=5BEBBB84'
    )
];

function manualFacebookPostImport(message: string, date: string, picture: string): FBPostResponse {
    return {
        created_time: date,
        full_picture: picture,
        id: 'id',
        is_hidden: false,
        is_published: true,
        message: message,
        from: {
            name: '',
            id: FB_PAGE_ID,
            error: ''
        },
        error: ''
    }
}