package Hampus.place.redis;

import Hampus.place.Pixel;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.Jedis;

@Repository
public class RedisRepo {

  public static final String KEY = "place";
  private static int IMAGE_SIZE = 5;

  private Jedis jedis = new Jedis("localhost");

  public void setPixel(Pixel p){
  int pp = ((p.getX()+p.getY()*IMAGE_SIZE)*6);
    jedis.bitfield(KEY,"SET", "u2", String.valueOf(pp), String.valueOf(p.getR()),
        "SET", "u2", String.valueOf(pp+2), String.valueOf(p.getG()),
        "SET", "u2", String.valueOf(pp+4), String.valueOf(p.getB()));

  }

  public Pixel getPixel(int x, int y){
    //To start redis: redis-server /usr/local/etc/redis.conf
    int pp = (x+y*IMAGE_SIZE)*6;
    List<Long> l = jedis.bitfield(KEY,
        "GET", "u2", String.valueOf(pp),
        "GET", "u2", String.valueOf(pp+2),
        "GET", "u2", String.valueOf(pp+4));

    List<Integer> li = l.stream().mapToInt(Long::intValue).boxed().collect(Collectors.toList());
    return Pixel.builder().r(li.get(0)).g(li.get(1)).b(li.get(2)).x(x).y(y).build();
  }




}
