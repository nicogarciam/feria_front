import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
import {createRequestOption} from '../helpers/request-util';
import {IPay} from '../models/pay.model';
import {IImage} from '../models/image.model';
import {ICity} from '../models/city.model';
import {FileUploader} from 'ng2-file-upload';
import {JwtAuthService} from './auth/jwt-auth.service';

type ResponseType = HttpResponse<IImage>;
type ArrayResponseType = HttpResponse<IImage[]>;

@Injectable({providedIn: 'root'})
export class ImageService {

    selectedImage = null;
    imageError: string;

    public resourceUrl = environment.apiURL + '/images';

    public noImageSrc = 'assets/images/no_image.png';


    public uploader: FileUploader = new FileUploader({
        url: environment.apiURL + '/images/upload',
        authToken: this.jwtAuthService.getAuthority(),
        itemAlias: 'image',
        authTokenHeader: 'Authorization',
        autoUpload: true,
        disableMultipart: false,
        allowedFileType: ['image']
    });

    constructor(protected http: HttpClient, private jwtAuthService: JwtAuthService) {
    }

    create(image: IImage): Observable<ResponseType> {
        return this.http.post<IImage>(this.resourceUrl, image, {observe: 'response'});
    }

    update(image: IImage): Observable<ResponseType> {
        return this.http.put<IImage>(this.resourceUrl, image, {observe: 'response'});
    }

    find(id: number): Observable<ResponseType> {
        return this.http.get<IImage>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    query(req?: any): Observable<ArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IImage[]>(this.resourceUrl, {params: options, observe: 'response'});
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/delete/${id}`, {observe: 'response'});
    }

    setPrimary(image: IImage): Observable<ArrayResponseType> {
        return this.http.put<IImage[]>(`${this.resourceUrl}/set_primary`, image, {observe: 'response'});
    }


    fileChangeEvent(fileInput: any): any {

        if (fileInput.target.files && fileInput.target.files[0]) {
            // Size Filter Bytes
            const max_size = 20971520;
            const allowed_types = ['image/png', 'image/jpeg'];
            const max_height = 15200;
            const max_width = 25600;

            if (fileInput.target.files[0].size > max_size) {
                this.imageError =
                    'Maximum size allowed is ' + max_size / 1000 + 'Mb';
                return false;
            }

            if (!allowed_types.includes(fileInput.target.files[0].type)) {
                this.imageError = 'Only Images are allowed ( JPG | PNG )';
                return false;
            }
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const image = new Image();
                image.src = e.target.result;
                image.onload = rs => {
                    const img_height = rs.currentTarget['height'];
                    const img_width = rs.currentTarget['width'];

                    console.log(img_height, img_width);

                    if (img_height > max_height && img_width > max_width) {
                        this.imageError =
                            'Maximum dimentions allowed ' +
                            max_height +
                            '*' +
                            max_width +
                            'px';
                        return false;
                    } else {
                        return this.selectedImage = fileInput.target.files[0];
                    }
                };
            };
            reader.readAsDataURL(fileInput.target.files[0]);
        }
    }


    uploadSelectedImage(): Observable<ResponseType> {
        const formData = new FormData();
        formData.append('image', this.selectedImage, this.selectedImage.name);

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');

        return this.http.post<any>(`${this.resourceUrl}/upload_image`, formData, { observe: 'response', headers: headers });
    }


}
