from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from backend.daos import GetDAOs, GetDAOsProtocol
from backend.models.buyer_models import Buyer
from backend.models.seller_models import Seller


class TokenData(BaseModel):
    # keycloak_uuid: UUID | None = None # Original field, might be used by Auth0Token.sub
    db_id: UUID # Database ID of the user (buyer or seller)
    user_type: str # "buyer" or "seller"
    # Add any other fields that might be useful from the token, e.g., email, name


class Auth0Token(BaseModel):
    """Decoded Access Token or ID Token from Auth0."""

    iss: str
    sub: str
    aud: list[str] | str
    iat: int
    exp: int
    azp: str | None = None
    scope: str | None = None
    permissions: list[str] | None = None


class AuthenticatedUser(BaseModel):
    """Represents a user authenticated via a token."""
    db_id: UUID
    keycloak_uuid: UUID # or use token.sub directly if that's the keycloak_uuid
    user_type: str # "buyer", "seller", "admin", etc.
    # Add other relevant user details you might extract from the token or DB lookup


ALGORITHM = "RS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# In a real app, we'd get this from the IdP's .well-known/jwks.json endpoint
# For this example, we'll use a placeholder.
# You'll need to replace this with your actual public key or implement JWKS fetching.
AUTH0_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuivSSWnL4xQf90Tf2N6Q
... (your actual public key) ...
-----END PUBLIC KEY-----"""


async def decode_token(token: str = Depends(oauth2_scheme)) -> Auth0Token:
    """Validates and decodes a JWT token from Auth0.

    In a real application, you would fetch the signing key from Auth0's
    JWKS endpoint (/.well-known/jwks.json). For simplicity, this example
    uses a hardcoded public key (which is not recommended for production).
    """
    try:
        # In a real app, you'd fetch the JWKS and select the correct key.
        # For this example, we assume the hardcoded key is the one to use.
        # You would also typically cache the JWKS for a period.
        payload = jwt.decode(
            token,
            AUTH0_PUBLIC_KEY,  # In a real app, use the key fetched from JWKS
            algorithms=[ALGORITHM],
            # Replace with your Auth0 domain and API audience
            audience="YOUR_API_AUDIENCE",
            issuer="https://YOUR_AUTH0_DOMAIN/",
        )
        return Auth0Token(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        # This will catch various errors like invalid signature, invalid issuer, etc.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_seller(
    daos: GetDAOs = Depends(), token: Auth0Token = Depends(decode_token)
) -> Seller:
    """Dependency to get the current seller based on the validated token."""
    if token.sub is None: # 'sub' usually holds the user ID
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Subject (user ID) not found in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        keycloak_uuid = UUID(token.sub) # Assuming 'sub' is the Keycloak UUID
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Subject (user ID) is not a valid UUID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    seller = await daos.seller.get_by_keycloak_uuid(keycloak_uuid)
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Seller not found for this token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return seller


async def get_current_buyer(
    daos: GetDAOs = Depends(), token: Auth0Token = Depends(decode_token)
) -> AuthenticatedUser:
    """
    Dependency to get the current buyer based on the validated token.
    Placeholder implementation.
    """
    if token.sub is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: Subject not found")
    try:
        keycloak_uuid = UUID(token.sub)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: Subject is not a valid UUID")

    # In a real implementation, you would look up the buyer in the database
    # using their keycloak_uuid (from token.sub)
    buyer = await daos.buyer.get_by_keycloak_uuid(keycloak_uuid) # Assuming BuyerDAO has this method
    if not buyer:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Buyer not found for this token")

    return AuthenticatedUser(db_id=buyer.id, keycloak_uuid=keycloak_uuid, user_type="buyer")


async def get_current_user(
    daos: GetDAOsProtocol = Depends(), token: Auth0Token = Depends(decode_token)
) -> AuthenticatedUser:
    """
    Dependency to get the current user (buyer or seller) based on the token.
    This is a placeholder and needs to determine if the sub is for a buyer or seller.
    A more robust solution might involve:
    1. A separate 'users' table linked to buyers/sellers.
    2. Custom claims in the JWT distinguishing user type.
    3. Attempting to find a buyer, then a seller (or vice-versa).
    """
    if token.sub is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: Subject not found")

    try:
        keycloak_uuid = UUID(token.sub)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: Subject is not a valid UUID")

    # Try finding as buyer
    buyer = await daos.buyer.get_by_keycloak_uuid(keycloak_uuid) # Assuming BuyerDAO has this
    if buyer:
        return AuthenticatedUser(db_id=buyer.id, keycloak_uuid=keycloak_uuid, user_type="buyer")

    # Try finding as seller
    seller = await daos.seller.get_by_keycloak_uuid(keycloak_uuid) # SellerDAO already has this
    if seller:
        return AuthenticatedUser(db_id=seller.id, keycloak_uuid=keycloak_uuid, user_type="seller")

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found for this token")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Helper to create an access token (not typically done by your API with Auth0).

    This function is more common if you were implementing your own OAuth2 server.
    With Auth0, your API primarily consumes and validates tokens.
    However, it's included here for completeness if you had a use case for it.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)  # Default expiry
    to_encode.update({"exp": expire})
    # You would need your own private key to sign tokens if your API were issuing them.
    # This example assumes you have a `JWT_SECRET_KEY` and `ALGORITHM` for this.
    # This part is illustrative and would differ from Auth0 token validation.
    encoded_jwt = jwt.encode(to_encode, "YOUR_SECRET_KEY", algorithm="HS256") # Example
    return encoded_jwt
