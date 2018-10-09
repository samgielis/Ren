import {FBPostResponse} from "./IFBResponse";
import {FB_PAGE_ID} from "./FacebookProxy";

export const manualFacebookFeed: FBPostResponse[] = [
    manualFacebookPostImport(
        'Ren Sport wordt 30 jaar in november. Het wordt een feest, we houden u op de hoogte.',
        '2018/09/29',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/42622440_825187714271527_7484433237192736768_n.jpg?_nc_cat=101&oh=60df80c73b86f2c634db964e3dcf84a8&oe=5C5BE254'
    ),
    manualFacebookPostImport(
        'Nieuw bij Ren Sport: Padel!',
        '2018/09/16',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/42092155_815230038600628_3539549451339169792_n.jpg?_nc_cat=101&oh=bd3fe2cb3c0a2a8b3f0712d82ca3b9c0&oe=5C21744E'
    ),
    manualFacebookPostImport(
        'Nog snel één van de 200 gelimiteerde SUPERTRAC ULTRA RC schoenen in de wacht slepen? Ren Sport helpt je graag verder.',
        '2018/08/24',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/39947224_796705753786390_8040626648711692288_n.png?_nc_cat=0&oh=24179afae6f3d200279e827d1ac6196a&oe=5C30AD21'
    ),
    manualFacebookPostImport(
        'NU bij Ren Sport. De nieuwe Mizuno Wave Ultima 10 – TCS Amsterdam Marathon editie.',
        '2018/08/17',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/39453905_788052064651759_7870217907072925696_n.jpg?_nc_cat=0&oh=d1ab8ff26008f21e252b76e9ac48eaac&oe=5C062056'
    ),
    manualFacebookPostImport(
        'Beste klanten, maandag 13, dinsdag 14 en woensdag 15 augustus zijn we gesloten. Donderdag zijn we terug open. Geniet van jullie mooi en sportief weekend.🌞🌞🏃‍♂️🏃‍♀️🎾🏊‍♂️🚴‍♂️🚴‍♀️. 😜',
        '2018/08/11',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/38926265_780068562116776_8787499153425956864_n.jpg?_nc_cat=0&oh=3187f9fc009fec9145c028a6e2bf6567&oe=5C0DB9D9'
    ),
    manualFacebookPostImport(
        'Knap podium Steffan Vanderlinden. Foto van de bosvrienden.',
        '2018/08/04',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/38528647_770318696425096_3281332864997654528_n.png?_nc_cat=0&oh=f4c2e87d86668e5de8a3dc6228f239d9&oe=5BFA69B2'
    ),
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
    )/*,
    manualFacebookPostImport(
        'Messalina Pieroni, mooi artikel en mooi foto’s.',
        '2018/07/03',
        'https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/36531094_733435116780121_1939821811734675456_n.jpg?_nc_cat=0&oh=6c7b5314822dc943f8b86f67cf4877e7&oe=5BDE4FA3'
    )*/
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